import React, { useEffect, useState } from "react";
// import { auth, db } from "../../firebaseConfig/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function FirebaseDebug() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser);
      setUser(currentUser);

      if (currentUser) {
        try {
          // Fetch specific user data
          const userDoc = await getDoc(doc(db, "userSignup", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            console.log("User document data:", data);
          } else {
            console.log("No user document found");
            setError("User document not found in Firestore");
          }

          // Fetch all users to see what's in the collection
          const usersSnapshot = await getDocs(collection(db, "userSignup"));
          const usersData = [];
          usersSnapshot.forEach((doc) => {
            usersData.push({ id: doc.id, ...doc.data() });
          });
          setAllUsers(usersData);
          console.log("All users in collection:", usersData);
        } catch (err) {
          console.error("Error fetching data:", err);
          setError(err.message);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading Firebase data...</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h2>Firebase Debug Information</h2>

      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f0f0f0",
          borderRadius: "5px",
        }}
      >
        <h3>Authentication Status</h3>
        <p>
          <strong>User Authenticated:</strong> {user ? "Yes" : "No"}
        </p>
        {user && (
          <>
            <p>
              <strong>User ID:</strong> {user.uid}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Email Verified:</strong>{" "}
              {user.emailVerified ? "Yes" : "No"}
            </p>
          </>
        )}
      </div>

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            backgroundColor: "#ffe6e6",
            borderRadius: "5px",
            color: "red",
          }}
        >
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {userData && (
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            backgroundColor: "#e6ffe6",
            borderRadius: "5px",
          }}
        >
          <h3>Current User Data</h3>
          <pre>{JSON.stringify(userData, null, 2)}</pre>

          {userData.location && (
            <div
              style={{
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "#e6f3ff",
                borderRadius: "5px",
              }}
            >
              <h4>Location Data</h4>
              <p>
                <strong>Latitude:</strong> {userData.location.latitude}
              </p>
              <p>
                <strong>Longitude:</strong> {userData.location.longitude}
              </p>
              <p>
                <strong>Accuracy:</strong> {userData.location.accuracy}
              </p>
              <p>
                <strong>Timestamp:</strong> {userData.location.timestamp}
              </p>
            </div>
          )}
        </div>
      )}

      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#fff5e6",
          borderRadius: "5px",
        }}
      >
        <h3>All Users in Collection ({allUsers.length} total)</h3>
        {allUsers.map((user, index) => (
          <div
            key={user.id}
            style={{
              marginBottom: "10px",
              padding: "5px",
              border: "1px solid #ddd",
              borderRadius: "3px",
            }}
          >
            <strong>User {index + 1}:</strong>
            <p>
              <strong>ID:</strong> {user.id}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Full Name:</strong> {user.fullName}
            </p>
            <p>
              <strong>Has Location:</strong> {user.location ? "Yes" : "No"}
            </p>
            {user.location && (
              <p>
                <strong>Location:</strong> {user.location.latitude},{" "}
                {user.location.longitude}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FirebaseDebug;
