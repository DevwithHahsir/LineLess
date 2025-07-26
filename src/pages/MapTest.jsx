import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig/firebase";
import MapView from "../map/MapView";

function MapTest() {
  const [userLocations, setUserLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserLocations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user signup data
      const userSignupCollection = collection(db, "userSignup");
      const userSignupSnapshot = await getDocs(userSignupCollection);

      // Fetch provider signup data
      const providerSignupCollection = collection(db, "providerSignup");
      const providerSignupSnapshot = await getDocs(providerSignupCollection);

      const locations = [];

      // Process user signup data
      userSignupSnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.location &&
          data.location.latitude &&
          data.location.longitude
        ) {
          locations.push({
            id: doc.id,
            name: data.fullName || data.email || "User",
            type: "Client",
            lat: data.location.latitude,
            lng: data.location.longitude,
            email: data.email,
            createdAt: data.createdAt?.toDate?.() || new Date(),
          });
        }
      });

      // Process provider signup data
      providerSignupSnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.location &&
          data.location.latitude &&
          data.location.longitude
        ) {
          locations.push({
            id: doc.id,
            name: data.businessName || data.email || "Provider",
            type: "Service Provider",
            lat: data.location.latitude,
            lng: data.location.longitude,
            email: data.email,
            serviceType: data.serviceType,
            createdAt: data.createdAt?.toDate?.() || new Date(),
          });
        }
      });

      console.log("Fetched user locations:", locations);
      setUserLocations(locations);
    } catch (error) {
      console.error("Error fetching user locations:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserLocations();
  }, []);

  const handleRefresh = () => {
    fetchUserLocations();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h1>Real-Time User Locations</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
          }}
        >
          {loading ? "Loading..." : "🔄 Refresh Locations"}
        </button>
      </div>
      <p>This page shows actual user and provider locations from Firebase:</p>

      <div
        style={{
          backgroundColor: "#d1ecf1",
          padding: "10px",
          borderRadius: "5px",
          marginBottom: "20px",
          fontSize: "14px",
        }}
      >
        <strong>Total locations found:</strong> {userLocations.length} users
        with location data
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p>Loading user locations...</p>
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && userLocations.length === 0 && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            color: "#856404",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          <strong>No location data found.</strong> Make sure users have provided
          their location during signup.
        </div>
      )}

      <div style={{ display: "grid", gap: "30px", marginTop: "20px" }}>
        {userLocations.map((location) => (
          <div
            key={location.id}
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              borderRadius: "8px",
              backgroundColor:
                location.type === "Client" ? "#e8f4fd" : "#fff5e6",
            }}
          >
            <div style={{ marginBottom: "10px" }}>
              <h3
                style={{
                  margin: "0 0 5px 0",
                  color: location.type === "Client" ? "#0c5460" : "#cc5500",
                }}
              >
                {location.name}
              </h3>
              <div style={{ fontSize: "14px", color: "#666" }}>
                <span
                  style={{
                    backgroundColor:
                      location.type === "Client" ? "#bee5eb" : "#ffd19a",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    marginRight: "10px",
                  }}
                >
                  {location.type}
                </span>
                {location.serviceType && (
                  <span style={{ marginRight: "10px" }}>
                    Service: {location.serviceType}
                  </span>
                )}
                <span>Email: {location.email}</span>
              </div>
              <p style={{ margin: "5px 0", fontSize: "14px", color: "#888" }}>
                Coordinates: {location.lat.toFixed(4)},{" "}
                {location.lng.toFixed(4)}
              </p>
              <p style={{ margin: "5px 0", fontSize: "12px", color: "#aaa" }}>
                Joined: {location.createdAt.toLocaleDateString()}
              </p>
            </div>
            <MapView lat={location.lat} lng={location.lng} />
          </div>
        ))}

        {/* Show message if no user locations */}
        {!loading && !error && userLocations.length === 0 && (
          <div
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              borderRadius: "8px",
              backgroundColor: "#f8f9fa",
            }}
          >
            <h3>No User Locations Available</h3>
            <p>No users have provided location data during signup yet.</p>
            <p>
              Encourage users to allow location access when signing up to see
              their locations here.
            </p>
            <MapView />
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#e7f3ff",
          borderRadius: "5px",
        }}
      >
        <h3>About Real-Time Locations:</h3>
        <ul>
          <li>
            <strong>Blue cards</strong> represent client locations
          </li>
          <li>
            <strong>Orange cards</strong> represent service provider locations
          </li>
          <li>Only users who provided location during signup are shown</li>
          <li>Location data is fetched in real-time from Firebase Firestore</li>
          <li>Refresh the page to see the latest user registrations</li>
        </ul>

        <h4>Troubleshooting:</h4>
        <ul>
          <li>Make sure Firebase is properly configured</li>
          <li>Check that users have allowed location access during signup</li>
          <li>Verify Firestore rules allow reading user data</li>
          <li>Check browser console for any errors</li>
        </ul>
      </div>
    </div>
  );
}

export default MapTest;
