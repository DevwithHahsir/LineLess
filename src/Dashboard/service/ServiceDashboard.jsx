import "./ServiceDashboard.css";
import "./appointments.css";
import Navbar from "../../componenets/navbar/Navbar";
import { useState, useEffect } from "react";
import BusinessForm from "../../componenets/businessform/BusinessForm";
import { db, auth } from "../../firebaseConfig/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
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
    } catch (error) {
      console.error("Error resetting queue:", error);
      alert("Failed to reset queue. Please try again.");
    }
  };

  const showForm = () => {
    setShowform((prev) => !prev);
  };

  // Fetch provider's businesses and appointments
  const fetchProviderData = async () => {
    try {
      setLoading(true);

      // Get current provider
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log("No authenticated user");
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

      // Fetch appointments for provider's businesses
      if (providerBusinesses.length > 0) {
        const businessIds = providerBusinesses.map((b) => b.id);
        const appointmentsSnapshot = await getDocs(
          collection(db, "appointments")
        );
        const allAppointments = appointmentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter appointments for this provider's businesses and add business category
        // Helper: numeric sort for queueNumber (supports strings like "token2")
        const numVal = (v) => {
          if (typeof v === "number") return v;
          if (typeof v === "string") {
            const m = v.match(/\d+/);
            if (m) return parseInt(m[0], 10);
          }
          return Number.MAX_SAFE_INTEGER;
        };

        const providerAppointments = allAppointments
          .filter((apt) => businessIds.includes(apt.businessId))
          .map((apt) => {
            // Find the business to get its category
            const business = providerBusinesses.find(
              (b) => b.id === apt.businessId
            );
            return {
              ...apt,
              businessCategory: business?.serviceCategory || "Unknown Category",
            };
          })
          .sort((a, b) => numVal(a.queueNumber) - numVal(b.queueNumber)); // Sort by queue number

        // Do NOT override status from Firestore; keep what's stored in DB
        setAppointments(providerAppointments);
      }
    } catch (error) {
      console.error("Error fetching provider data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchProviderData();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  // Advance to next token: mark current as served, next as CURRENT, update business currentToken
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

      // Consider only active appointments
      const ACTIVE = new Set([
        "CURRENT",
        "PENDING",
        "ACCEPTED",
        "ONGOING",
        "SERVING",
      ]);
      const active = appointments.filter((a) =>
        ACTIVE.has((a.status || "").toUpperCase())
      );
      if (active.length === 0) {
        alert("No active appointments to advance.");
        return;
      }

      // Sort active by queue number
      const ordered = [...active].sort(
        (a, b) => numVal(a.queueNumber) - numVal(b.queueNumber)
      );

      // Current = marked CURRENT, else the smallest queue number
      const currentIdx = ordered.findIndex(
        (a) => (a.status || "").toUpperCase() === "CURRENT"
      );
      const currentAppt = currentIdx >= 0 ? ordered[currentIdx] : ordered[0];
      const currentNum = numVal(currentAppt.queueNumber);
      const nextAppt = ordered.find((a) => numVal(a.queueNumber) > currentNum);

      // 1) Mark current as served (so it's no longer active)
      await updateDoc(doc(db, "appointments", currentAppt.id), {
        status: "served",
      });

      // 2) If there's a next one, mark it as CURRENT
      if (nextAppt) {
        await updateDoc(doc(db, "appointments", nextAppt.id), {
          status: "CURRENT",
        });
        // 3) Update business currentToken to next token number
        await updateDoc(
          doc(db, "businessRegistrations", currentAppt.businessId),
          {
            currentToken: numVal(nextAppt.queueNumber) || 0,
          }
        );
      } else {
        // Queue finished: reset currentToken to 0 for that business
        await updateDoc(
          doc(db, "businessRegistrations", currentAppt.businessId),
          {
            currentToken: 0,
          }
        );
      }

      // 4) Set all other future appointments for this business to pending
      const othersToPending = ordered.filter(
        (a) => a.id !== currentAppt.id && (!nextAppt || a.id !== nextAppt.id)
      );
      await Promise.all(
        othersToPending.map((apt) =>
          updateDoc(doc(db, "appointments", apt.id), { status: "pending" })
        )
      );

      // Optimistic UI update
      setAppointments((prev) => {
        const updated = prev.map((apt) => {
          // Only adjust appointments for this business in the local state
          if (apt.businessId !== currentAppt.businessId) return apt;
          if (apt.id === currentAppt.id) return { ...apt, status: "served" };
          if (nextAppt && apt.id === nextAppt.id)
            return { ...apt, status: "CURRENT" };
          // all other for this business -> pending
          return { ...apt, status: "pending" };
        });
        return updated.sort(
          (a, b) => numVal(a.queueNumber) - numVal(b.queueNumber)
        );
      });

      // Then refresh from server
      await refreshData();
    } catch (e) {
      console.error("Failed to advance to next token:", e);
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
