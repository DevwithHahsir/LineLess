/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import Alert from "../../componenets/alert/Alert";
import { useForm } from "react-hook-form";
import "./providerSignup.css";

import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { googleProvider } from "../../firebaseConfig/firebase";
import { auth } from "../../firebaseConfig/firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig/firebase";

export default function ProviderSignup() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "success", message: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    // Validate required fields
    if (!data.businessName) {
      setAlert({ type: "error", message: "Business name is required!" });
      return;
    }
    if (!data.email) {
      setAlert({ type: "error", message: "Email is required!" });
      return;
    }
    if (!data.password) {
      setAlert({ type: "error", message: "Password is required!" });
      return;
    }
    if (!data.serviceType) {
      setAlert({ type: "error", message: "Service type is required!" });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      const userData = {
        businessName: data.businessName,
        email: data.email,
        password: data.password,
        location: userLocation || null,
        serviceType: data.serviceType,
        createdAt: new Date(),
        role: "provider", // Add role for permission management
        userType: "provider", // Add user type for identification
      };

      await setDoc(doc(db, "providerSignup", user.uid), userData);

      // Also create a document in the central users collection for role management
      // await setDoc(doc(db, "users", user.uid), {
      //   email: data.email,
      //   businessName: data.businessName,
      //   serviceType: data.serviceType,
      //   role: "provider",
      //   userType: "provider",
      //   createdAt: new Date(),
      //   uid: user.uid,
      // });

      setAlert({
        type: "success",
        message: "Provider account created successfully! Welcome to LineLess!",
      });

      // Navigate to service provider dashboard with delay and replace
      setTimeout(() => {
        window.location.href = "/service/Servicedashboard";
      }, 100);
    } catch (error) {
      // More specific error messages
      let errorMessage = "Provider signup failed: ";
      if (error.code === "auth/email-already-in-use") {
        errorMessage +=
          "This email is already registered. Try logging in instead.";
      } else if (error.code === "auth/weak-password") {
        errorMessage +=
          "Password is too weak. Please choose a stronger password (at least 6 characters).";
      } else if (error.code === "auth/invalid-email") {
        errorMessage += "Invalid email address format.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage += "Network error. Please check your internet connection.";
      } else if (error.code === "permission-denied") {
        errorMessage +=
          "Database permission denied. Please check Firestore rules.";
      } else if (error.code === "unavailable") {
        errorMessage += "Database temporarily unavailable. Please try again.";
      } else {
        errorMessage += error.message;
      }

      setAlert({ type: "error", message: errorMessage });
    }
  };

  // const getCurrentLocation = () => {
  //   setLocationLoading(true);
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const locationData = {
  //           latitude: position.coords.latitude,
  //           longitude: position.coords.longitude,
  //           accuracy: position.coords.accuracy,
  //           timestamp: new Date().toISOString(),
  //         };
  //         setUserLocation(locationData);
  //         setLocationLoading(false);
  //       },
  //       (error) => {
  //         setLocationLoading(false);
  //         alert(`Location error: ${error.message}`);
  //       },
  //       {
  //         enableHighAccuracy: true,
  //         timeout: 10000,
  //         maximumAge: 60000,
  //       }
  //     );
  //   } else {
  //     setLocationLoading(false);
  //     alert("Geolocation is not supported by this browser.");
  //   }
  // };

  const handleGoogleSignup = async () => {
    try {
      // Use popup with proper error handling
      await signInWithPopup(auth, googleProvider);
      setAlert({
        type: "success",
        message: "Google signup successful! Welcome to LineLess!",
      });

      // Navigate to service provider dashboard with delay and replace
      setTimeout(() => {
        window.location.href = "/service/Servicedashboard";
      }, 100);
    } catch (error) {
      setAlert({
        type: "error",
        message: `Google sign-in error: ${error.message}`,
      });
    }
  };

  return (
    <>
      {alert.message && (
        <Alert
          type={alert.type}
          message={alert.message}
          duration={2500}
          onClose={() => setAlert({ ...alert, message: "" })}
        />
      )}
      <div className="form-main-container">
        <div className="form-section">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h2 className="service-provider-login-headind">
              Service Provider Signup
            </h2>

            {/* Google Sign-up Button */}
            <div className="google-auth-container">
              <button
                type="button"
                className="google-signin-btn"
                onClick={handleGoogleSignup}
              >
                <svg
                  className="google-icon"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="inputs">
              <input
                id="businessName"
                type="text"
                placeholder="Enter your business name"
                {...register("businessName", {
                  required: "Business name is required",
                })}
              />
              {errors.businessName && (
                <span style={{ color: "red" }}>
                  {errors.businessName.message}
                </span>
              )}
            </div>

            <div className="inputs">
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Please enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <span style={{ color: "red" }}>{errors.email.message}</span>
              )}
            </div>

            <div className="inputs">
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {errors.password && (
                <span style={{ color: "red" }}>{errors.password.message}</span>
              )}
            </div>

            <div className="select">
              <select
                id="serviceType"
                {...register("serviceType", {
                  required: "Please select a service type",
                })}
                className="elegant-dropdown"
              >
                <option value="">Select a service</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Salon & Beauty">Salon & Beauty</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Automotive">Automotive</option>
                <option value="Retail Store">Retail Store</option>
                <option value="Fitness & Gym">Fitness & Gym</option>
                <option value="Education">Education</option>
                <option value="Banking">Banking</option>
                <option value="Government Office">Government Office</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Professional Services">
                  Professional Services
                </option>
                <option value="Other">Other</option>
              </select>
              {errors.serviceType && (
                <span style={{ color: "red" }}>
                  {errors.serviceType.message}
                </span>
              )}
            </div>
            {/* 
            <div className="service-provider-location">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className={userLocation ? "location-captured" : ""}
              >
                {locationLoading
                  ? "Getting Location..."
                  : userLocation
                  ? "✓ Location Captured"
                  : "Get Current Location"}
              </button>

            </div> */}

            <div className="submit-prvider-btn">
              <button type="submit">Sign Up as Provider</button>
            </div>

            <div className="login-link">
              <span>Have an account already? </span>
              <a href="/provider/login" className="login-link-text">
                Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
