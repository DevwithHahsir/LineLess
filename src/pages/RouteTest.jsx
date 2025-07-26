import React from "react";
import { Link } from "react-router-dom";

function RouteTest() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Route Testing Page</h1>
      <p>Test all routes and navigation in your LineLess application:</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {/* User Routes */}
        <div
          style={{
            backgroundColor: "#e8f4fd",
            padding: "20px",
            borderRadius: "10px",
            border: "1px solid #bee5eb",
          }}
        >
          <h3 style={{ color: "#0c5460", marginBottom: "15px" }}>
            👤 User Routes
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <Link
              to="/user/signup"
              style={{
                padding: "10px",
                backgroundColor: "#17a2b8",
                color: "white",
                textDecoration: "none",
                borderRadius: "5px",
                textAlign: "center",
              }}
            >
              User Signup
            </Link>
            <Link
              to="/user/login"
              style={{
                padding: "10px",
                backgroundColor: "#007bff",
                color: "white",
                textDecoration: "none",
                borderRadius: "5px",
                textAlign: "center",
              }}
            >
              User Login
            </Link>
            <Link
              to="/client/clientdashboard"
              style={{
                padding: "10px",
                backgroundColor: "#28a745",
                color: "white",
                textDecoration: "none",
                borderRadius: "5px",
                textAlign: "center",
              }}
            >
              Client Dashboard
            </Link>
          </div>
        </div>

        {/* Provider Routes */}
        <div
          style={{
            backgroundColor: "#fff5e6",
            padding: "20px",
            borderRadius: "10px",
            border: "1px solid #ffd19a",
          }}
        >
          <h3 style={{ color: "#cc5500", marginBottom: "15px" }}>
            🛠️ Provider Routes
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <Link
              to="/provider/signup"
              style={{
                padding: "10px",
                backgroundColor: "#fd7e14",
                color: "white",
                textDecoration: "none",
                borderRadius: "5px",
                textAlign: "center",
              }}
            >
              Provider Signup
            </Link>
            <Link
              to="/provider/login"
              style={{
                padding: "10px",
                backgroundColor: "#dc3545",
                color: "white",
                textDecoration: "none",
                borderRadius: "5px",
                textAlign: "center",
              }}
            >
              Provider Login
            </Link>
            <Link
              to="/service/Servicedashboard"
              style={{
                padding: "10px",
                backgroundColor: "#6f42c1",
                color: "white",
                textDecoration: "none",
                borderRadius: "5px",
                textAlign: "center",
              }}
            >
              Service Dashboard
            </Link>
          </div>
        </div>

        {/* Other Routes */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "10px",
            border: "1px solid #dee2e6",
          }}
        >
          <h3 style={{ color: "#495057", marginBottom: "15px" }}>
            🏠 Other Routes
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <Link
              to="/"
              style={{
                padding: "10px",
                backgroundColor: "#6c757d",
                color: "white",
                textDecoration: "none",
                borderRadius: "5px",
                textAlign: "center",
              }}
            >
              Home Page
            </Link>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#d1ecf1",
          borderRadius: "10px",
          border: "1px solid #bee5eb",
        }}
      >
        <h3 style={{ color: "#0c5460" }}>✅ Testing Instructions:</h3>
        <ol style={{ color: "#0c5460" }}>
          <li>Click on any route above to test navigation</li>
          <li>Test form submissions on signup/login pages</li>
          <li>
            Test Google authentication (should redirect to respective
            dashboards)
          </li>
          <li>Verify forgot password functionality on login pages</li>
          <li>Check that all dashboards load correctly</li>
        </ol>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#d4edda",
          borderRadius: "5px",
          border: "1px solid #c3e6cb",
        }}
      >
        <p style={{ margin: 0, color: "#155724" }}>
          🎯 <strong>Current Route:</strong> /route-test
        </p>
      </div>
    </div>
  );
}

export default RouteTest;
