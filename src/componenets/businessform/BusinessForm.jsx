import React, { useState } from "react";
import "./businessform.css"; // Import the CSS file
import { db } from "../../firebaseConfig/firebase";
import { setDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import BusinessDetail from "../bussinessDetail/BusinessDetail";

const BusinessForm = ({ onFormSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    type: "",
    latitude: "",
    longitude: "",
    openTime: "",
    closeTime: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [RemoveForm, SetRemoveForm] = useState(true);

  const handleCloseBusinessDetail = () => {
    // When user wants to close BusinessDetail, notify parent to close entire form
    if (onFormSubmitSuccess) {
      onFormSubmitSuccess();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Business Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Business name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Business name must be at least 2 characters";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-()]{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Business Type validation
    if (!formData.type) {
      newErrors.type = "Please select a business type";
    }

    // Opening Time validation
    if (!formData.openTime) {
      newErrors.openTime = "Opening time is required";
    }

    // Closing Time validation
    if (!formData.closeTime) {
      newErrors.closeTime = "Closing time is required";
    }

    // Time comparison validation
    if (formData.openTime && formData.closeTime) {
      if (formData.openTime >= formData.closeTime) {
        newErrors.closeTime = "Closing time must be after opening time";
      }
    }

    // Location validation
    if (!formData.latitude || !formData.longitude) {
      newErrors.location =
        "Please get your location by clicking the location button";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formErrors = validateForm();

    if (Object.keys(formErrors).length === 0) {
      // Form is valid, submit data
      try {
        // Get current user
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          alert("Please login to register your business.");
          return;
        }

        // Add timestamp and count fields to the form data
        const dataToSubmit = {
          ...formData,
          createdAt: new Date(),
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          count: 0,
          currentCount: 0,
          uid: user.uid, // Add user ID for reference
          displayName: formData.name, // Add displayName field for consistency
          businessType: formData.type, // Add businessType field for consistency
          physicalAddress: `${formData.latitude}, ${formData.longitude}`, // Add address
        };

        // Use setDoc with user.uid as document ID instead of addDoc
        const userDocRef = doc(db, "BusinessProviderForm", user.uid);
        await setDoc(userDocRef, dataToSubmit);

        console.log("Document written with user UID: ", user.uid);

        alert("Business registered successfully!");

        // Close the form after successful submission
        SetRemoveForm(false);

        // Don't notify parent to close - we want to show BusinessDetail instead
        // if (onFormSubmitSuccess) {
        //   onFormSubmitSuccess();
        // }

        // Reset form after successful submission
        setFormData({
          name: "",
          phone: "",
          type: "",
          latitude: "",
          longitude: "",
          openTime: "",
          closeTime: "",
        });
        setErrors({});
      } catch (error) {
        console.error("Error adding document: ", error);
        alert("Error registering business. Please try again.");

        // Remove the commented code
      }
    } else {
      // Form has errors, set them to display
      setErrors(formErrors);
    }

    setIsSubmitting(false);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });

          // Clear location error if it exists
          if (errors.location) {
            setErrors({
              ...errors,
              location: "",
            });
          }

          alert("Location captured successfully!");
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Unable to get location. Please enable location services and try again."
          );
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <>
      {RemoveForm ? (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Business Name</label>
              <input
                placeholder="Hair Saloon"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={errors.name ? "error" : ""}
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className={errors.phone ? "error" : ""}
                placeholder="e.g., +1-234-567-8900"
              />
              {errors.phone && (
                <span className="error-message">{errors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label>Business Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className={errors.type ? "error" : ""}
              >
                <option value="">Select Type</option>
                <option value="bank">Bank</option>
                <option value="salon">Salon</option>
                <option value="clinic">Clinic</option>
                <option value="government">Government Office</option>
                <option value="other">Other</option>
              </select>
              {errors.type && (
                <span className="error-message">{errors.type}</span>
              )}
            </div>

            <div className="form-group">
              <label>Opening Time</label>
              <input
                type="time"
                name="openTime"
                value={formData.openTime}
                onChange={handleChange}
                required
                className={errors.openTime ? "error" : ""}
              />
              {errors.openTime && (
                <span className="error-message">{errors.openTime}</span>
              )}
            </div>

            <div className="form-group">
              <label>Closing Time</label>
              <input
                type="time"
                name="closeTime"
                value={formData.closeTime}
                onChange={handleChange}
                required
                className={errors.closeTime ? "error" : ""}
              />
              {errors.closeTime && (
                <span className="error-message">{errors.closeTime}</span>
              )}
            </div>

            <div className="form-group">
              <label>Location</label>
              <button type="button" onClick={handleGetLocation}>
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
                {formData.latitude && formData.longitude
                  ? "Captured ✓"
                  : "Get Location"}
              </button>
              {errors.location && (
                <span className="error-message">{errors.location}</span>
              )}
            </div>

            <div className="form-button">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register Business"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="BusinessDetail-container">
          <BusinessDetail onClose={handleCloseBusinessDetail} />
        </div>
      )}
    </>
  );
};

export default BusinessForm;
