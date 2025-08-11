import React, { useState } from "react";
import { db } from "../firebaseConfig/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

function FirebaseTest() {
  const [status, setStatus] = useState("");
  const [testData, setTestData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Test writing to Firestore
  const testWrite = async () => {
    setLoading(true);
    try {
      // Try different collection names to test permissions
      const testCollections = [
        "test",
        "testData",
        "public",
        "businessRegistrations",
      ];
      let success = false;

      for (const collectionName of testCollections) {
        try {
          const docRef = await addDoc(collection(db, collectionName), {
            message: "Hello from Firebase!",
            timestamp: new Date(),
            testId: Math.random().toString(36).substr(2, 9),
          });
          setStatus(
            `✅ Write test successful! Document ID: ${docRef.id} in collection: ${collectionName}`
          );
          success = true;
          break;
        } catch {
          // ignore detailed console output; update status only
        }
      }

      if (!success) {
        setStatus(
          `❌ Write test failed for all collections. Check Firestore security rules.`
        );
      }
    } catch (error) {
      setStatus(`❌ Write test failed: ${error.message}`);
    }
    setLoading(false);
  };

  // Test reading from Firestore
  const testRead = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "test"));
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setTestData(data);
      setStatus(`✅ Read test successful! Found ${data.length} documents`);
    } catch (error) {
      setStatus(`❌ Read test failed: ${error.message}`);
    }
    setLoading(false);
  };

  // Test connection
  const testConnection = async () => {
    setLoading(true);
    try {
      // Try to access Firestore
      collection(db, "connectionTest");
      setStatus("✅ Firebase connection successful!");
    } catch (error) {
      setStatus(`❌ Connection failed: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Firebase Database Connection Test</h2>

      <div style={{ marginBottom: "2rem" }}>
        <h3>Test Controls</h3>
        <button
          onClick={testConnection}
          disabled={loading}
          style={{ marginRight: "10px", padding: "10px 20px" }}
        >
          Test Connection
        </button>
        <button
          onClick={testWrite}
          disabled={loading}
          style={{ marginRight: "10px", padding: "10px 20px" }}
        >
          Test Write
        </button>
        <button
          onClick={testRead}
          disabled={loading}
          style={{ padding: "10px 20px" }}
        >
          Test Read
        </button>
      </div>

      {loading && <p>⏳ Testing...</p>}

      {status && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1rem",
            backgroundColor: status.includes("✅") ? "#d4edda" : "#f8d7da",
            border: `1px solid ${
              status.includes("✅") ? "#c3e6cb" : "#f5c6cb"
            }`,
            borderRadius: "4px",
          }}
        >
          <strong>Status:</strong> {status}
          {status.includes("❌") && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
              <strong>Common Solutions:</strong>
              <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                <li>Update Firestore security rules in Firebase Console</li>
                <li>Enable Firestore Database if not already enabled</li>
                <li>Check if you're in the correct Firebase project</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {testData.length > 0 && (
        <div>
          <h3>Test Data Retrieved:</h3>
          <pre
            style={{
              backgroundColor: "#f8f9fa",
              padding: "1rem",
              borderRadius: "4px",
              overflow: "auto",
            }}
          >
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: "2rem", fontSize: "0.9rem", color: "#666" }}>
        <h4>Firebase Config Info:</h4>
        <p>
          <strong>Project ID:</strong> lineless-f84fc
        </p>
        <p>
          <strong>Auth Domain:</strong> lineless-f84fc.firebaseapp.com
        </p>
        <p>
          <strong>Database:</strong> Firestore
        </p>
      </div>
    </div>
  );
}

export default FirebaseTest;
