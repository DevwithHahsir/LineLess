import React from "react";
import Navbar from "../../componenets/navbar/Navbar";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig/firebase"; // make sure this path is correct
import MapView from "../../map/MapView";
import "./ClientDashboard.css";
import ListServices from "../../componenets/listServices/ListServices";

function ClientDashboard() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [businessesLoading, setBusinessesLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!user) {
        setLocation({ lat: 40.7128, lng: -74.006 });
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "userSignup", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();

          // Check if location data exists and has the correct structure
          if (
            data.location &&
            data.location.latitude &&
            data.location.longitude
          ) {
            setLocation({
              lat: data.location.latitude,
              lng: data.location.longitude,
            });
          } else {
            setLocation(null);
          }
        } else {
          setLocation(null);
        }
      } catch (error) {
        console.error("Error fetching user location:", error);
        setLocation(null);
      }
    };

    if (!loading) {
      fetchLocation();
    }
  }, [user, loading]);

  // Fetch business locations from Firebase
  useEffect(() => {
    const fetchBusinessLocations = async () => {
      try {
        setBusinessesLoading(true);

        const querySnapshot = await getDocs(
          collection(db, "BusinessProviderForm")
        );
        const businessList = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Check if business has location data
          if (data.latitude && data.longitude) {
            businessList.push({
              id: doc.id,
              ...data,
            });
          }
        });

        setBusinesses(businessList);
      } catch (error) {
        console.error("Error fetching business locations:", error);
      } finally {
        setBusinessesLoading(false);
      }
    };

    fetchBusinessLocations();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // You may want to update the user's location in Firestore or state here
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          alert(`Location error: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <>
      <div className="navbar-container">
        <Navbar />
      </div>
      <div className="client-dashboard">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Book Token & Save Time</h1>
            <h2 className="dashboard-subtitle">
              Book your Token or Appointment remotely and save time!
            </h2>
          </div>

          {loading ? (
            <div className="loading-container">
              <p className="loading-text">Loading user data...</p>
            </div>
          ) : (
            <div className="dashboard-content">
              <div className="location-section">
                <h3 className="location-header">
                  Your Location & Nearby Services
                </h3>

                {location && location.lat && location.lng ? (
                  <>
                    <div>
                      <div className="map-container">
                        {businessesLoading ? (
                          <div
                            style={{
                              height: "400px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid #ccc",
                              borderRadius: "8px",
                              backgroundColor: "#f8f9fa",
                            }}
                          >
                            <p>Loading nearby services...</p>
                          </div>
                        ) : (
                          <MapView
                            lat={location.lat}
                            lng={location.lng}
                            businesses={businesses}
                          />
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: "10px",
                        fontSize: "14px",
                        color: "#666",
                      }}
                    >
                      <p>
                        📍 Your location | 🏢 Service providers (
                        {businesses.length} found)
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="no-location">
                    <p>
                      No location data available. Please update your location in
                      your profile.
                      <button
                        onClick={getCurrentLocation}
                        className="locationButton"
                      >
                        Get Location
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SERVICES LIST */}
          <div className="services-list-container">
            <ListServices />
          </div>
        </div>
      </div>
    </>
  );
}

export default ClientDashboard;
