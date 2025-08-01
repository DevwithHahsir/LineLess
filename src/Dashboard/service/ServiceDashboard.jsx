import React, { useState, useEffect } from "react";
import "./ServiceDashboard.css";
import Navbar from "../../componenets/navbar/Navbar";
import BusinessForm from "../../componenets/businessform/BusinessForm";
import MapView from "../../map/MapView";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig/firebase"; // corrected Firebase config path
import { getAuth } from "firebase/auth";
import { FaRegAddressCard } from "react-icons/fa";
import { CiLocationArrow1 } from "react-icons/ci";
import { getAddressFromCoordinates } from "../../utils/geocoding";

function ServiceDashboard() {
  const [openBusinessForm, setOpenBusinessForm] = useState(false);
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [physicalAddress, setPhysicalAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);

  const AddBusiness = () => {
    setOpenBusinessForm((prev) => !prev);
  };

  // Function to check if business is currently open
  const isBusinessOpen = (openTime, closeTime) => {
    if (!openTime || !closeTime) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes

    // Parse opening time (format: "HH:MM")
    const [openHour, openMinute] = openTime.split(":").map(Number);
    const openTimeInMinutes = openHour * 60 + openMinute;

    // Parse closing time (format: "HH:MM")
    const [closeHour, closeMinute] = closeTime.split(":").map(Number);
    const closeTimeInMinutes = closeHour * 60 + closeMinute;

    // Handle overnight businesses (close time < open time)
    if (closeTimeInMinutes < openTimeInMinutes) {
      return (
        currentTime >= openTimeInMinutes || currentTime <= closeTimeInMinutes
      );
    }

    // Regular hours (close time > open time)
    return (
      currentTime >= openTimeInMinutes && currentTime <= closeTimeInMinutes
    );
  };

  // Function to format time display
  const formatTime = (time) => {
    if (!time) return "N/A";

    // If time is already in format like "09:00", return as is
    if (time.includes(":")) {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }

    return time;
  };

  const fetchBusiness = async () => {
    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        // Set user email from authentication
        setUserEmail(user.email);

        const userRef = doc(db, "BusinessProviderForm", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setBusinessData(data);

          // Convert lat/lng to real address
          if (data.latitude && data.longitude) {
            setAddressLoading(true);
            try {
              const addressData = await getAddressFromCoordinates(
                parseFloat(data.latitude),
                parseFloat(data.longitude)
              );
              setPhysicalAddress(
                addressData.formatted || addressData.fullAddress
              );
            } catch (addressError) {
              console.error("Address conversion error:", addressError);
              setPhysicalAddress(`${data.latitude}, ${data.longitude}`);
            } finally {
              setAddressLoading(false);
            }
          }
        } else {
          setError("No business registered yet. Please add your business.");
        }
      } else {
        setError("Please login to view your business details.");
      }
    } catch (err) {
      console.error("Error fetching business:", err);
      setError("Error fetching business details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch business data when component mounts
  useEffect(() => {
    fetchBusiness();
  }, []);

  return (
    <>
      <div className="navbar">
        <Navbar isProvider={true} />
      </div>

      <div className="heading-container">
        <h1>Service Provider</h1>
        <h4>List Your Business and Connect with Nearby Clients</h4>
      </div>

      <div className="btn-addbusiness">
        <button className="addService" onClick={AddBusiness}>
          + Add Your Business
        </button>
      </div>

      {/* Business Details Section */}
      <div className="business-details-section">
        {loading && (
          <div className="loading-container">
            <p>Loading your business details...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        )}

        {businessData && !loading && !error && (
          <div className="business-details-layout">
            {/* Contact Information Section */}
            <div className="contact-information">
              <div className="section-header">
                <span className="contact-icon">
                  <FaRegAddressCard />
                </span>
                <h3>Contact Information</h3>
              </div>

              <div className="contact-details">
                <div className="detail-item">
                  <label>Phone Number</label>
                  <p>{businessData.phone || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label>Address</label>
                  {addressLoading ? (
                    <p style={{ fontStyle: "italic", color: "#666" }}>
                      Converting coordinates to address...
                    </p>
                  ) : (
                    <p>
                      {physicalAddress || businessData.physicalAddress || "N/A"}
                    </p>
                  )}
                </div>
                <div className="detail-item">
                  <label>Category</label>
                  <div className="category-tag">
                    <p> {businessData.businessType || "N/A"} </p>
                  </div>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <p>{userEmail || "N/A"}</p>
                </div>{" "}
                {/* Business Hours */}
                {(businessData.openTime || businessData.closeTime) && (
                  <div className="detail-item">
                    <label>Business Hours</label>
                    <p>
                      {formatTime(businessData.openTime)} -{" "}
                      {formatTime(businessData.closeTime)}
                    </p>
                  </div>
                )}
                {/* Business Status */}
                {businessData.openTime && businessData.closeTime && (
                  <div className="detail-item">
                    <label>Status</label>
                    <div
                      className={`status-badge ${
                        isBusinessOpen(
                          businessData.openTime,
                          businessData.closeTime
                        )
                          ? "open"
                          : "closed"
                      }`}
                    >
                      {isBusinessOpen(
                        businessData.openTime,
                        businessData.closeTime
                      )
                        ? "🟢 Open"
                        : "🔴 Closed"}
                    </div>
                  </div>
                )}
                {businessData.businessDescription && (
                  <div className="detail-item">
                    <label>Description</label>
                    <p>{businessData.businessDescription}</p>
                  </div>
                )}
                {businessData.avgWaitingTime && (
                  <div className="detail-item">
                    <label>Average Waiting Time</label>
                    <p>{businessData.avgWaitingTime} minutes</p>
                  </div>
                )}
                {businessData.maxCapacityPerHour && (
                  <div className="detail-item">
                    <label>Max Capacity/Hour</label>
                    <p>{businessData.maxCapacityPerHour} customers</p>
                  </div>
                )}
              </div>
            </div>

            {/* Business Location Section */}
            <div className="business-location">
              <div className="section-header">
                <span className="location-icon"></span>
                <h3>
                  {" "}
                  <CiLocationArrow1 />
                  Business Location
                </h3>
              </div>
              <div className="map-container">
                {businessData.latitude && businessData.longitude ? (
                  <MapView
                    lat={parseFloat(businessData.latitude)}
                    lng={parseFloat(businessData.longitude)}
                    businesses={[
                      {
                        id: "current-business",
                        businessName: businessData.displayName,
                        latitude: businessData.latitude,
                        longitude: businessData.longitude,
                        type: businessData.businessType,
                        description: businessData.businessDescription,
                      },
                    ]}
                  />
                ) : (
                  <div className="map-placeholder">
                    <div className="location-pin">
                      <span className="pin-icon"></span>
                    </div>
                    <div className="coordinates">
                      <p>No location data available</p>
                      <p>Please update your business location</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {openBusinessForm ? <BusinessForm /> : ""}
    </>
  );
}

export default ServiceDashboard;
