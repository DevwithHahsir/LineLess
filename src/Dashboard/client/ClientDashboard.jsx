import React from "react";
import Navbar from "../../componenets/navbar/Navbar";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig/firebase"; // make sure this path is correct
import MapView from "../../map/MapView";
import "./ClientDashboard.css";


function ClientDashboard() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(
        "Auth state changed:",
        currentUser ? "User logged in" : "No user"
      );
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!user) {
        console.log("No user authenticated, setting default location");
        setLocation({ lat: 40.7128, lng: -74.006 });
        return;
      }

      console.log("Fetching location for user:", user.uid);

      try {
        const userDoc = await getDoc(doc(db, "userSignup", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log("User data from Firebase:", data); // Debug log

          // Check if location data exists and has the correct structure
          if (
            data.location &&
            data.location.latitude &&
            data.location.longitude
          ) {
            console.log("Location found:", data.location);
            setLocation({
              lat: data.location.latitude,
              lng: data.location.longitude,
            });
          } else {
            console.log("No location data found in user document");
            setLocation(null);
          }
        } else {
          console.log("User document does not exist in Firestore");
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
        <Navbar/>
    </div>
    <div className="client-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">User Dashboard</h1>
          <h2 className="dashboard-subtitle">Welcome to Your Client Portal</h2>
        </div>

        {loading ? (
          <div className="loading-container">
            <p className="loading-text">Loading user data...</p>
          </div>
        ) : (
          <div className="dashboard-content">
            <div className="location-section">
              <h3 className="location-header">Your Location</h3>
              
              {location && location.lat && location.lng ? (
                <div>
                 
                  <div className="map-container">
                    <MapView lat={location.lat} lng={location.lng} />
                  </div>
                </div>
              ) : (
                <div className="no-location">
                  <p>
                    No location data available. Please update your location in
                    your profile. <button  onClick={getCurrentLocation} className="locationButton"> Get Location</button>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default ClientDashboard;
