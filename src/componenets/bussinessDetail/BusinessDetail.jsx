import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig/firebase"; // your Firebase config file

function BusinessDetail() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          // Fetch from BusinessProviderForm collection (same as ServiceDashboard)
          const userDocRef = doc(db, "BusinessProviderForm", user.uid);

          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserData(data);
          } else {
            setError(
              "No business data found! Please register your business first."
            );
          }
        } else {
          setError("Please login to view business details.");
        }
      } catch (err) {
        console.error("Error fetching business data:", err);
        setError("Error loading business details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div>
        <p>Loading business details...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div>
        <p>{error}</p>
      </div>
    );
  }

  // Show business details if data exists
  if (userData) {
    return (
      <div>
        <h2>Business Details</h2>
        <div>
          <strong>Business Name:</strong> {userData.displayName || "N/A"}
        </div>
        <div>
          <strong>Phone:</strong> {userData.phone || "N/A"}
        </div>
        <div>
          <strong>Business Type:</strong> {userData.businessType || "N/A"}
        </div>
        <div>
          <strong>Email:</strong> {userData.email || "N/A"}
        </div>
        <div>
          <strong>Address:</strong> {userData.physicalAddress || "N/A"}
        </div>
        <div>
          <strong>Description:</strong> {userData.businessDescription || "N/A"}
        </div>
        {userData.avgWaitingTime && (
          <div>
            <strong>Average Waiting Time:</strong> {userData.avgWaitingTime}
            {" 35min / "}
            minutes
          </div>
        )}
        {userData.maxCapacityPerHour && (
          <div>
            <strong>Max Capacity/Hour:</strong> {userData.maxCapacityPerHour}{" "}
            customers
          </div>
        )}
      </div>
    );
  }

  // Fallback (shouldn't reach here with proper logic above)
  return (
    <div>
      <p>No business data available.</p>
    </div>
  );
}

export default BusinessDetail;
