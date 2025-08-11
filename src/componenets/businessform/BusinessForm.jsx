import React, { useState } from "react";
import "./businessform.css";
import { db, auth } from "../../firebaseConfig/firebase";
import { collection, addDoc, doc } from "firebase/firestore";

function BusinessForm({ onFormSubmitSuccess }) {
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    location: "",
    latitude: "",
    longitude: "",
    openTime: "",
    closeTime: "",
    serviceCategory: "",
    businessDescription: "",
    avgWaitingTime: "",
    maxCapacityPerHour: "",
    count: 0,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const serviceCategories = [
    "Retail Store",
    "Fitness & Gym",
    "Education",
    "Banking",
    "Government Office",
    "Entertainment",
    "Professional Services",
    "Other",
  ];

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case "businessName": {
        if (!value.trim()) return "Business name is required";
        if (value.trim().length < 2)
          return "Business name must be at least 2 characters";
        if (value.trim().length > 100)
          return "Business name must be less than 100 characters";
        return "";
      }

      case "email": {
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value))
          return "Please enter a valid email address";
        return "";
      }

      case "phone": {
        if (!value.trim()) return "Phone number is required";
        const phoneRegex = /^(\+92|0)?[0-9]{10}$/;
        if (!phoneRegex.test(value.replace(/\s+/g, "")))
          return "Please enter a valid Pakistani phone number";
        return "";
      }

      case "serviceCategory": {
        if (!value) return "Service category is required";
        return "";
      }

      case "openTime": {
        if (!value.trim()) return "Opening time is required";
        return "";
      }

      case "closeTime": {
        if (!value.trim()) return "Closing time is required";
        if (value && formData.openTime && value <= formData.openTime) {
          return "Closing time must be after opening time";
        }
        return "";
      }

      case "location": {
        if (!value.trim()) return "Business location is required";
        return "";
      }

      case "avgWaitingTime": {
        if (!value.toString().trim()) return "Average waiting time is required";
        const num = Number(value);
        if (Number.isNaN(num) || num < 0 || num > 1440) {
          return "Waiting time must be between 0 and 1440 minutes";
        }
        return "";
      }

      case "maxCapacityPerHour": {
        if (!value.trim()) return "Max capacity per hour is required";
        if (value && (isNaN(value) || value < 1 || value > 10000)) {
          return "Capacity must be between 1 and 10000 customers";
        }
        return "";
      }

      case "businessDescription": {
        if (!value.trim()) return "Business description is required";
        if (value && value.length > 1000) {
          return "Description must be less than 1000 characters";
        }
        return "";
      }

      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field and validate
    const fieldError = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));

    // Special case: re-validate time fields when one changes
    if (name === "openTime" || name === "closeTime") {
      const otherTimeField = name === "openTime" ? "closeTime" : "openTime";
      const otherTimeValue =
        name === "openTime" ? formData.closeTime : formData.openTime;

      if (otherTimeValue) {
        const otherFieldError = validateField(otherTimeField, otherTimeValue);
        setErrors((prev) => ({
          ...prev,
          [otherTimeField]: otherFieldError,
        }));
      }
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            location: `${position.coords.latitude}, ${position.coords.longitude}`,
          }));
        },
        (error) => {
          alert("Error getting location: " + error.message);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all fields
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);

      // Focus on first error field
      const firstErrorField = Object.keys(formErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Check if required fields are filled
    const requiredFields = [
      "businessName",
      "email",
      "phone",
      "location",
      "openTime",
      "closeTime",
      "serviceCategory",
      "businessDescription",
      "avgWaitingTime",
      "maxCapacityPerHour",
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field].trim()
    );

    if (missingFields.length > 0) {
      const newErrors = {};
      missingFields.forEach((field) => {
        newErrors[field] = "This field is required";
      });
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Clear any remaining errors
    setErrors({});

    try {
      // Get current user (provider)
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("You must be logged in to register a business.");
        setIsSubmitting(false);
        return;
      }

      // Save business as subcollection under provider
      const businessData = {
        ...formData,
        // Ensure latitude and longitude are numbers, not strings
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        // Ensure numeric fields are properly typed
        avgWaitingTime: formData.avgWaitingTime
          ? parseInt(formData.avgWaitingTime)
          : null,
        maxCapacityPerHour: formData.maxCapacityPerHour
          ? parseInt(formData.maxCapacityPerHour)
          : null,
        count: 0, // Initialize appointment count to 0
        createdAt: new Date(),
        status: "active",
        providerId: currentUser.uid, // Link to provider
      };

      // Save to subcollection: providerSignup/{providerId}/businessRegistrations/{businessId}
      const providerDocRef = doc(db, "providerSignup", currentUser.uid);
      const businessCollectionRef = collection(
        providerDocRef,
        "businessRegistrations"
      );
      const docRef = await addDoc(businessCollectionRef, businessData);

      // Also save to main collection for easier querying by clients
      await addDoc(collection(db, "businessRegistrations"), {
        ...businessData,
        businessId: docRef.id, // Reference to subcollection document
      });

      // Clear all form fields after successful submission
      setFormData({
        businessName: "",
        email: "",
        phone: "",
        location: "",
        latitude: "",
        longitude: "",
        openTime: "",
        closeTime: "",
        serviceCategory: "",
        businessDescription: "",
        avgWaitingTime: "",
        maxCapacityPerHour: "",
        count: 0,
      });

      // Call the success callback if provided
      if (onFormSubmitSuccess) {
        onFormSubmitSuccess();
      }

      // Show success message
      alert("Business registered successfully!");
    } catch (error) {
      // More user-friendly error message
      let errorMessage = "Error registering business. Please try again.";
      if (error.code === "permission-denied") {
        errorMessage =
          "Permission denied. Please check Firestore security rules.";
      } else if (error.code === "unavailable") {
        errorMessage =
          "Service temporarily unavailable. Please try again later.";
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mainForm-container">
        <h2>Business Registration Form</h2>

        <form onSubmit={handleSubmit}>
          {/* Business Name & Email */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="businessName">Business Name *</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Enter your business name"
                className={errors.businessName ? "error" : ""}
                required
              />
              {errors.businessName && (
                <span className="error-message">{errors.businessName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={errors.email ? "error" : ""}
                required
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>
          </div>

          {/* Phone & Service Category */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+92xxxxxxxxxx"
                className={errors.phone ? "error" : ""}
                required
              />
              {errors.phone && (
                <span className="error-message">{errors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="serviceCategory">Service Category *</label>
              <select
                id="serviceCategory"
                name="serviceCategory"
                value={formData.serviceCategory}
                onChange={handleInputChange}
                className={errors.serviceCategory ? "error" : ""}
                required
              >
                <option value="">Select a category</option>
                {serviceCategories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.serviceCategory && (
                <span className="error-message">{errors.serviceCategory}</span>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="location">Business Location *</label>
              <div className="location-input-group">
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter address or click 'Get Current Location'"
                  className={errors.location ? "error" : ""}
                  required
                  readOnly
                />
                <button
                  type="button"
                  className="location-btn"
                  onClick={handleLocationClick}
                >
                  Get Current Location
                </button>
              </div>
              {errors.location && (
                <span className="error-message">{errors.location}</span>
              )}
            </div>
          </div>

          {/* Opening & Closing Times */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="openTime">Opening Time *</label>
              <input
                type="time"
                id="openTime"
                name="openTime"
                value={formData.openTime}
                onChange={handleInputChange}
                className={errors.openTime ? "error" : ""}
                required
              />
              {errors.openTime && (
                <span className="error-message">{errors.openTime}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="closeTime">Closing Time *</label>
              <input
                type="time"
                id="closeTime"
                name="closeTime"
                value={formData.closeTime}
                onChange={handleInputChange}
                className={errors.closeTime ? "error" : ""}
                required
              />
              {errors.closeTime && (
                <span className="error-message">{errors.closeTime}</span>
              )}
            </div>
          </div>

          {/* Business Description */}
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="businessDescription">
                Business Description *
              </label>
              <textarea
                id="businessDescription"
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleInputChange}
                placeholder="Describe your business and services"
                className={errors.businessDescription ? "error" : ""}
                rows="4"
                required
              />
              {errors.businessDescription && (
                <span className="error-message">
                  {errors.businessDescription}
                </span>
              )}
            </div>
          </div>

          {/* Additional Business Info */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="avgWaitingTime">Waiting Time (minutes) *</label>
              <input
                type="number"
                id="avgWaitingTime"
                name="avgWaitingTime"
                value={formData.avgWaitingTime}
                onChange={handleInputChange}
                placeholder="e.g., 15"
                className={errors.avgWaitingTime ? "error" : ""}
                min="0"
                required
              />
              {errors.avgWaitingTime && (
                <span className="error-message">{errors.avgWaitingTime}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="maxCapacityPerHour">
                Max Capacity Per Hour *
              </label>
              <input
                type="number"
                id="maxCapacityPerHour"
                name="maxCapacityPerHour"
                value={formData.maxCapacityPerHour}
                onChange={handleInputChange}
                placeholder="e.g., 20"
                className={errors.maxCapacityPerHour ? "error" : ""}
                min="1"
                required
              />
              {errors.maxCapacityPerHour && (
                <span className="error-message">
                  {errors.maxCapacityPerHour}
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-submit">
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register Business"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default BusinessForm;
