import React, { useState } from "react";
import "./businessform.css"; // Import the CSS file

const BusinessForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    type: "",
    latitude: "",
    longitude: "",
    openTime: "",
    closeTime: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
    // Submit to Firebase or backend
  };

  return (
    <div className="form-container">
      {/* <div className="form-card"> */}
      {/* <h2 className="form-title">Register Your Business</h2> */}
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>Business Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Business Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="bank">Bank</option>
            <option value="salon">Salon</option>
            <option value="clinic">Clinic</option>
            <option value="government">Government Office</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Opening Time</label>
          <input
            type="time"
            name="openTime"
            value={formData.openTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Closing Time</label>
          <input
            type="time"
            name="closeTime"
            value={formData.closeTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <button type="button">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: "8px" }}
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="currentColor"
              />
            </svg>
            Get Location
          </button>
        </div>

        <div className="form-button">
          <button type="submit">Register Business</button>
        </div>
      </form>
      {/* </div> */}
    </div>
  );
};

export default BusinessForm;
