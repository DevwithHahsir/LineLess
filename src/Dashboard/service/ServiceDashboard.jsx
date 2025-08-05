
import "./ServiceDashboard.css";
import Navbar from "../../componenets/navbar/Navbar";
import { useState, useEffect } from "react";
import BusinessForm from "../../componenets/businessform/BusinessForm";
import { db } from "../../firebaseConfig/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";



function ServiceDashboard() {
  const [showform, setShowform] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [myBusinesses, setMyBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("business"); // "business" or "appointments"

  const showForm = () => {
    setShowform((prev) => !prev);
  };

  // Fetch provider's businesses and appointments
  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setLoading(true);
        
        // For demo purposes, we'll show all businesses
        // In a real app, you'd filter by logged-in provider's email/ID
        const businessSnapshot = await getDocs(collection(db, "businessRegistrations"));
        const businesses = businessSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMyBusinesses(businesses);

        // Fetch appointments for provider's businesses
        if (businesses.length > 0) {
          const businessIds = businesses.map(b => b.id);
          const appointmentsSnapshot = await getDocs(collection(db, "appointments"));
          const allAppointments = appointmentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Filter appointments for this provider's businesses
          const providerAppointments = allAppointments.filter(apt => 
            businessIds.includes(apt.businessId)
          );
          
          setAppointments(providerAppointments);
        }
      } catch (error) {
        console.error("Error fetching provider data:", error);
      } finally {
        setLoading(false);
      }
    };

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
            <div><BusinessForm /></div>
          ) : (
            <div className="business-info">
              {myBusinesses.length > 0 ? (
                <div className="registered-businesses">
                  <h3>Your Registered Businesses:</h3>
                  {myBusinesses.map(business => (
                    <div key={business.id} className="business-card">
                      <h4>{business.businessName}</h4>
                      <p><strong>Category:</strong> {business.serviceCategory}</p>
                      <p><strong>Current Queue:</strong> {business.count || 0}</p>
                      <p><strong>Status:</strong> {business.status || "Active"}</p>
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
          <h3>Client Appointments</h3>
          {loading ? (
            <div className="loading">Loading appointments...</div>
          ) : appointments.length > 0 ? (
            <div className="appointments-list">
              {appointments.map(appointment => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-header">
                    <h4>Queue #{appointment.queueNumber}</h4>
                    <span className="appointment-status">{appointment.status}</span>
                  </div>
                  <div className="appointment-details">
                    <p><strong>Client Name:</strong> {appointment.clientName}</p>
                    <p><strong>Business:</strong> {appointment.businessName}</p>
                    <p><strong>Booked At:</strong> {formatDate(appointment.appointmentDate)}</p>
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
