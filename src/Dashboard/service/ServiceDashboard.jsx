import React from "react";
import "./ServiceDashboard.css";

function ServiceDashboard() {
  return (
    <div className="service-dashboard">
      <div className="service-dashboard-container">
        <div className="service-dashboard-header">
          <h1 className="service-dashboard-title">
            Service Provider Dashboard
          </h1>
        </div>

        <div className="service-dashboard-grid">
          <div className="service-card welcome-card">
            <h3>Welcome to Your Business Hub!</h3>
            <p>
              You have successfully logged in to your service provider
              dashboard.
            </p>
            <p>
              Manage your services, view bookings, and grow your business with
              LineLess.
            </p>
          </div>

          <div className="service-card tools-card">
            <h3>Business Tools</h3>
            <ul className="tools-list">
              <li>🛠️ Manage Services</li>
              <li>📋 View Bookings</li>
              <li>💰 Earnings Report</li>
              <li>📊 Analytics</li>
              <li>⚙️ Business Settings</li>
            </ul>
          </div>
        </div>

        <div className="status-banner">
          <p>
            ✅ Navigation Test: Service provider dashboard is working correctly!
          </p>
        </div>
      </div>
    </div>
  );
}

export default ServiceDashboard;
