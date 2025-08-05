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
          .sort((a, b) => a.queueNumber - b.queueNumber); // Sort by queue number

        // Update status: mark the appointment with lowest queue number as "CURRENT"
        const updatedAppointments = providerAppointments.map((apt, index) => ({
          ...apt,
          status:
            index === 0 && providerAppointments.length > 0
              ? "CURRENT"
              : "pending",
        }));

        setAppointments(updatedAppointments);
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
              <BusinessForm />
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
                          �️ Reset Queue & Clear Appointments
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
              🔄 Refresh
            </button>
          </div>
          {loading ? (
            <div className="loading">Loading appointments...</div>
          ) : appointments.length > 0 ? (
            <div className="appointments-list">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-header">
                    <h4>Queue #{appointment.queueNumber}</h4>
                    <span
                      className="appointment-status"
                      style={{
                        backgroundColor:
                          appointment.status === "CURRENT"
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
                      <strong>Client Name:</strong> {appointment.clientName}
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
          ) : (
            <div className="no-appointments">No appointments yet</div>
          )}
        </div>
      )}
    </>
  );
}

export default ServiceDashboard;
