import "./ServiceDashboard.css";
import "./appointments.css";
import Navbar from "../../componenets/navbar/Navbar";
import { useState, useEffect, useCallback } from "react";
import BusinessForm from "../../componenets/businessform/BusinessForm";
import { db, auth } from "../../firebaseConfig/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

function ServiceDashboard() {
  const [showform, setShowform] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [myBusinesses, setMyBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("business"); // "business" or "appointments"

  // Function to refresh data
  const refreshData = async () => {
    setLoading(true);
    await fetchProviderData();
    setLoading(false);
  };

  // Function to reset queue count for a business
  const resetQueueCount = async (businessId, businessName) => {
    try {
      const confirmReset = window.confirm(
        `Are you sure you want to reset the queue for "${businessName}"? This will:\n- Set count to 0\n- Delete ALL appointments for this business\n\nThis action cannot be undone.`
      );

      if (!confirmReset) return;

      // Step 1: Delete all appointments for this business
      const appointmentsSnapshot = await getDocs(
        collection(db, "appointments")
      );
      const businessAppointments = appointmentsSnapshot.docs.filter(
        (doc) => doc.data().businessId === businessId
      );

      // Delete each appointment
      const deletePromises = businessAppointments.map((appointmentDoc) =>
        deleteDoc(doc(db, "appointments", appointmentDoc.id))
      );
      await Promise.all(deletePromises);

      // Step 2: Update the count to 0 in the main businessRegistrations collection
      const businessRef = doc(db, "businessRegistrations", businessId);
      await updateDoc(businessRef, {
        count: 0,
      });

      // Step 3: Refresh the data to show updated count and empty appointments
      await refreshData();

      alert(
        `Queue reset successfully for "${businessName}"!\n- Count reset to 0\n- ${businessAppointments.length} appointments deleted`
      );
    } catch {
      alert("Failed to reset queue. Please try again.");
    }
  };

  const showForm = () => {
    setShowform((prev) => !prev);
  };

  // Fetch provider's businesses and appointments
  const fetchProviderData = useCallback(async () => {
    try {
      setLoading(true);

      // Get current provider
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      // Fetch businesses from main collection that belong to this provider
      const businessSnapshot = await getDocs(
        collection(db, "businessRegistrations")
      );
      const allBusinesses = businessSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter businesses that belong to current provider
      const providerBusinesses = allBusinesses.filter(
        (business) => business.providerId === currentUser.uid
      );
      setMyBusinesses(providerBusinesses);
    } catch {
      // no console output per request
    } finally {
      setLoading(false);
    }
  }, []);

  // normalizeQueueStatuses removed: real-time listener now drives state

  // Initial data fetch
  useEffect(() => {
    fetchProviderData();
  }, [fetchProviderData]);

  // Real-time listener for appointments of this provider's businesses
  useEffect(() => {
    if (!auth.currentUser) return;
    const ids = myBusinesses.map((b) => b.id);
    if (ids.length === 0) {
      setAppointments([]);
      return;
    }

    // Helper to chunk ids for Firestore 'in' (max 10)
    const chunks = [];
    for (let i = 0; i < ids.length; i += 10) {
      chunks.push(ids.slice(i, i + 10));
    }

    const byChunk = new Map();
    const businessCat = new Map(
      myBusinesses.map((b) => [b.id, b.serviceCategory || "Unknown Category"])
    );

    const numVal = (v) => {
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const m = v.match(/\d+/);
        if (m) return parseInt(m[0], 10);
      }
      return Number.MAX_SAFE_INTEGER;
    };

    const unsubs = chunks.map((idChunk, idx) =>
      onSnapshot(
        query(
          collection(db, "appointments"),
          where("businessId", "in", idChunk)
        ),
        (snap) => {
          const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          byChunk.set(idx, arr);
          // Combine all chunks
          const combined = Array.from(byChunk.values()).flat();
          const merged = combined.map((apt) => ({
            ...apt,
            businessCategory:
              businessCat.get(apt.businessId) || "Unknown Category",
          }));
          setAppointments(
            merged.sort((a, b) => numVal(a.queueNumber) - numVal(b.queueNumber))
          );
          setLoading(false);
        }
      )
    );

    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, [myBusinesses]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  // Advance to next token per business: current -> SERVED, next -> CURRENT, others -> PENDING
  const advanceNextToken = async () => {
    try {
      if (appointments.length === 0) {
        alert("No appointments to advance.");
        return;
      }

      // Helper: numeric value from queueNumber (supports strings like "token2")
      const numVal = (v) => {
        if (typeof v === "number") return v;
        if (typeof v === "string") {
          const m = v.match(/\d+/);
          if (m) return parseInt(m[0], 10);
        }
        return Number.MAX_SAFE_INTEGER;
      };

      // Group by business
      const byBusiness = appointments.reduce((acc, apt) => {
        (acc[apt.businessId] = acc[apt.businessId] || []).push(apt);
        return acc;
      }, {});

      // Pick target business: one that currently has CURRENT, else the business with the smallest next token
      let targetBusinessId = null;
      let targetCurrent = null;
      let candidate = null;

      const ACTIVE = new Set([
        "CURRENT",
        "PENDING",
        "ACCEPTED",
        "ONGOING",
        "SERVING",
      ]);

      for (const [businessId, appts] of Object.entries(byBusiness)) {
        const active = appts
          .filter((a) => ACTIVE.has((a.status || "").toUpperCase()))
          .sort((a, b) => numVal(a.queueNumber) - numVal(b.queueNumber));
        if (active.length === 0) continue;
        const cur =
          active.find((a) => (a.status || "").toUpperCase() === "CURRENT") ||
          active[0];
        if (
          (cur.status || "").toUpperCase() === "CURRENT" &&
          targetBusinessId == null
        ) {
          targetBusinessId = businessId;
          targetCurrent = cur;
        }
        // Candidate is the business with the smallest active token if none had explicit CURRENT
        if (
          !candidate ||
          numVal(active[0].queueNumber) < numVal(candidate.queueNumber)
        ) {
          candidate = active[0];
        }
      }

      if (!targetBusinessId && candidate) {
        targetBusinessId = candidate.businessId;
        targetCurrent = candidate;
      }

      if (!targetBusinessId || !targetCurrent) {
        alert("No active appointments to advance.");
        return;
      }

      const allForBusiness = appointments
        .filter((a) => a.businessId === targetBusinessId)
        .sort((a, b) => numVal(a.queueNumber) - numVal(b.queueNumber));

      const activeForBusiness = allForBusiness.filter(
        (a) => (a.status || "").toUpperCase() !== "SERVED"
      );
      const currentAppt = targetCurrent;
      const currentNum = numVal(currentAppt.queueNumber);
      const nextAppt = activeForBusiness.find(
        (a) => numVal(a.queueNumber) > currentNum
      );

      // 1) Mark current as served (so it's no longer active)
      await updateDoc(doc(db, "appointments", currentAppt.id), {
        status: "SERVED",
      });

      // 2) If there's a next one, mark it as CURRENT
      if (nextAppt) {
        await updateDoc(doc(db, "appointments", nextAppt.id), {
          status: "CURRENT",
        });
        // 3) Update business currentToken to next token number
        await updateDoc(
          doc(db, "businessRegistrations", currentAppt.businessId),
          { currentToken: numVal(nextAppt.queueNumber) || 0 }
        );
      } else {
        // Queue finished: reset currentToken to 0 for that business
        await updateDoc(
          doc(db, "businessRegistrations", currentAppt.businessId),
          { currentToken: 0 }
        );
      }

      // 4) Set all other future appointments for this business to pending
      const othersToPending = activeForBusiness.filter(
        (a) => a.id !== currentAppt.id && (!nextAppt || a.id !== nextAppt.id)
      );
      await Promise.all(
        othersToPending.map((apt) =>
          updateDoc(doc(db, "appointments", apt.id), { status: "PENDING" })
        )
      );

      // Optimistic UI update
      setAppointments((prev) => {
        const updated = prev.map((apt) => {
          // Only adjust appointments for this business in the local state
          if (apt.businessId !== currentAppt.businessId) return apt;
          if (apt.id === currentAppt.id) return { ...apt, status: "SERVED" };
          if (nextAppt && apt.id === nextAppt.id)
            return { ...apt, status: "CURRENT" };
          // all other for this business -> pending
          return { ...apt, status: "PENDING" };
        });
        return updated.sort(
          (a, b) => numVal(a.queueNumber) - numVal(b.queueNumber)
        );
      });

      // Then refresh from server
      await refreshData();
    } catch {
      alert("Failed to advance token. Please try again.");
    }
  };

  return (
    <>
      <div className="navbar">
        <Navbar isProvider={true} />
      </div>

      <div className="heading-container">
        <h1>Service Provider Dashboard</h1>
        <h4>Manage Your Business and View Appointments</h4>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "business" ? "active" : ""}`}
          onClick={() => setActiveTab("business")}
        >
          Manage Business
        </button>
        <button
          className={`tab-btn ${activeTab === "appointments" ? "active" : ""}`}
          onClick={() => setActiveTab("appointments")}
        >
          View Appointments ({appointments.length})
        </button>
      </div>

      {/* Business Management Tab */}
      {activeTab === "business" && (
        <div className="business-tab">
          <div className="btn-addbusiness">
            <button className="addService" onClick={showForm}>
              + Add Your Business
            </button>
          </div>

          {/* Business Form */}
          {showform ? (
            <div>
              <BusinessForm
                onFormSubmitSuccess={() => {
                  setShowform(false);
                  refreshData();
                }}
              />
            </div>
          ) : (
            <div className="business-info">
              {myBusinesses.length > 0 ? (
                <div className="registered-businesses">
                  <h3>Your Registered Businesses:</h3>
                  {myBusinesses.map((business) => (
                    <div key={business.id} className="business-card">
                      <h4>{business.businessName}</h4>
                      <p>
                        <strong>Category:</strong> {business.serviceCategory}
                      </p>
                      <p>
                        <strong>Current Queue:</strong> {business.count || 0}
                      </p>
                      <p>
                        <strong>Status:</strong> {business.status || "Active"}
                      </p>
                      <div className="business-actions">
                        <button
                          className="reset-queue-btn"
                          onClick={() =>
                            resetQueueCount(business.id, business.businessName)
                          }
                          style={{
                            backgroundColor: "#f44336",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            marginTop: "10px",
                          }}
                        >
                          Reset & Clear Appointments
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-business">No Business is registered</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === "appointments" && (
        <div className="appointments-tab">
          <div className="appointments-header">
            <h3>Client Appointments</h3>

            {/* Next token Butoon */}
            <button
              className="next-tokken-btn"
              style={{
                padding: "8px 16px",
                backgroundColor: "#2c3e50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={advanceNextToken}
            >
              Next Token
            </button>

            <button
              className="refresh-btn"
              onClick={refreshData}
              style={{
                padding: "8px 16px",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="loading">Loading appointments...</div>
          ) : appointments.length > 0 ? (
            <div className="appointments-groups">
              {(() => {
                // Helper to sort tokens numerically and put CURRENT first
                const numVal = (v) => {
                  if (typeof v === "number") return v;
                  if (typeof v === "string") {
                    const m = v.match(/\d+/);
                    if (m) return parseInt(m[0], 10);
                  }
                  return Number.MAX_SAFE_INTEGER;
                };
                const isStatus = (apt, s) =>
                  (apt.status || "").toUpperCase() === s;
                const activeSet = new Set([
                  "CURRENT",
                  "PENDING",
                  "ACCEPTED",
                  "ONGOING",
                  "SERVING",
                ]);
                const active = appointments
                  .filter((a) => activeSet.has((a.status || "").toUpperCase()))
                  .sort((a, b) => {
                    const aCur = isStatus(a, "CURRENT") ? 0 : 1;
                    const bCur = isStatus(b, "CURRENT") ? 0 : 1;
                    if (aCur !== bCur) return aCur - bCur; // CURRENT first
                    return numVal(a.queueNumber) - numVal(b.queueNumber);
                  });
                const served = appointments.filter((a) =>
                  isStatus(a, "SERVED")
                );

                return (
                  <>
                    {/* Active (Current on top) */}
                    <div className="appointments-list">
                      {active.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="appointment-card"
                          style={{
                            border: isStatus(appointment, "CURRENT")
                              ? "2px solid #4caf50"
                              : "1px solid #e0e0e0",
                            boxShadow: isStatus(appointment, "CURRENT")
                              ? "0 0 0 2px rgba(76,175,80,0.15)"
                              : undefined,
                          }}
                        >
                          <div className="appointment-header">
                            <h4>Token Number {appointment.queueNumber}</h4>
                            <span
                              className="appointment-status"
                              style={{
                                backgroundColor: isStatus(
                                  appointment,
                                  "CURRENT"
                                )
                                  ? "#4caf50"
                                  : "#ff9800",
                                color: "white",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              {appointment.status}
                            </span>
                          </div>
                          <div className="appointment-details">
                            <p>
                              <strong>Client Name:</strong>{" "}
                              {appointment.clientName}
                            </p>
                            <p>
                              <strong>Business Category:</strong>{" "}
                              {appointment.businessCategory}
                            </p>
                            <p>
                              <strong>Time:</strong>{" "}
                              {formatDate(appointment.appointmentDate)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Served section */}
                    {served.length > 0 && (
                      <div className="served-section" style={{ marginTop: 24 }}>
                        <h4 style={{ marginBottom: 12 }}>
                          Served Appointments
                        </h4>
                        <div className="appointments-list">
                          {served
                            .sort(
                              (a, b) =>
                                numVal(a.queueNumber) - numVal(b.queueNumber)
                            )
                            .map((appointment) => (
                              <div
                                key={appointment.id}
                                className="appointment-card"
                                style={{
                                  border: "2px solid #f44336",
                                  background: "#ffebee",
                                }}
                              >
                                <div className="appointment-header">
                                  <h4>
                                    Token Number {appointment.queueNumber}
                                  </h4>
                                  <span
                                    className="appointment-status"
                                    style={{
                                      backgroundColor: "#f44336",
                                      color: "white",
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {appointment.status}
                                  </span>
                                </div>
                                <div className="appointment-details">
                                  <p>
                                    <strong>Client Name:</strong>{" "}
                                    {appointment.clientName}
                                  </p>
                                  <p>
                                    <strong>Business Category:</strong>{" "}
                                    {appointment.businessCategory}
                                  </p>
                                  <p>
                                    <strong>Booked At:</strong>{" "}
                                    {formatDate(appointment.appointmentDate)}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="no-appointments">No appointments yet</div>
          )}
        </div>
      )}
    </>
  );
}

export default ServiceDashboard;
