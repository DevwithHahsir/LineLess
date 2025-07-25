import React from "react";
import { useForm } from "react-hook-form";
import "./providerSignup.css";
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { googleProvider } from "../../firebaseConfig/firebase";
import { auth } from "../../firebaseConfig/firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig/firebase";

export default function ProviderSignup() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    // Validate required fields
    if (!data.businessName) {
      alert("Business name is required!");
      return;
    }
    if (!data.email) {
      alert("Email is required!");
      return;
    }
    if (!data.password) {
      alert("Password is required!");
      return;
    }
    if (!data.serviceType) {
      alert("Service type is required!");
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
        userType: "provider", // Add user type for identification
      };

      await setDoc(doc(db, "providerSignup", user.uid), userData);

      alert("Provider account created successfully! Welcome to LineLess!");

      // Navigate to a dashboard or home page instead of login
      // navigate("/provider/dashboard"); // Uncomment when you have a dashboard
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

      alert(errorMessage);
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          };
          setUserLocation(locationData);
          setLocationLoading(false);
        },
        (error) => {
          setLocationLoading(false);
          alert(`Location error: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      setLocationLoading(false);
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // You can save user data to Firestore here if needed
    } catch (error) {
      alert(`Google sign-in error: ${error.message}`);
    }
  };

  return (
    <>
      <div className="form-main-container">
        <div className="form-image-section">
          <div className="image-content">
            <svg
              width="300"
              height="300"
              viewBox="0 0 300 300"
              className="form-illustration"
            >
              {/* Provider signup illustration */}
              <defs>
                <linearGradient
                  id="providerGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#ff9800" />
                  <stop offset="100%" stopColor="#f57c00" />
                </linearGradient>
              </defs>

              {/* Background circle */}
              <circle
                cx="150"
                cy="150"
                r="140"
                fill="url(#providerGradient)"
                opacity="0.1"
              />

              {/* Business building */}
              <rect
                x="120"
                y="100"
                width="60"
                height="80"
                fill="url(#providerGradient)"
                rx="5"
              />
              <rect x="130" y="110" width="10" height="10" fill="white" />
              <rect x="150" y="110" width="10" height="10" fill="white" />
              <rect x="170" y="110" width="10" height="10" fill="white" />
              <rect x="130" y="130" width="10" height="10" fill="white" />
              <rect x="150" y="130" width="10" height="10" fill="white" />
              <rect x="170" y="130" width="10" height="10" fill="white" />
              <rect x="140" y="160" width="20" height="20" fill="white" />

              {/* Service tools */}
              <g transform="translate(70, 70)">
                {/* Wrench */}
                <rect
                  x="0"
                  y="10"
                  width="15"
                  height="3"
                  fill="#2f3542"
                  transform="rotate(45)"
                />
                <circle cx="0" cy="10" r="3" fill="#2f3542" />
                <circle cx="15" cy="25" r="2" fill="#2f3542" />
              </g>

              <g transform="translate(200, 80)">
                {/* Hammer */}
                <rect x="5" y="0" width="3" height="20" fill="#8b4513" />
                <rect x="0" y="0" width="13" height="6" fill="#2f3542" />
              </g>

              {/* Service provider person */}
              <circle cx="150" cy="220" r="20" fill="url(#providerGradient)" />
              <rect
                x="135"
                y="240"
                width="30"
                height="25"
                fill="url(#providerGradient)"
                rx="5"
              />

              {/* Location marker */}
              <path
                d="M80 200 Q80 185 95 185 Q110 185 110 200 Q110 210 95 225 Q80 210 80 200 Z"
                fill="#ff4757"
              />
              <circle cx="95" cy="200" r="5" fill="white" />

              {/* Star rating */}
              <g transform="translate(210, 200)">
                <polygon
                  points="10,2 12,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 8,8"
                  fill="#ffd700"
                />
                <polygon
                  points="25,2 27,8 33,8 28,12 30,18 25,14 20,18 22,12 17,8 23,8"
                  fill="#ffd700"
                />
              </g>

              {/* Connecting lines */}
              <path
                d="M95 225 Q120 200 150 200"
                stroke="url(#providerGradient)"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
                strokeDasharray="5,5"
              />
              <path
                d="M150 180 Q175 190 210 205"
                stroke="url(#providerGradient)"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
                strokeDasharray="5,5"
              />
            </svg>

            <h3>Start Your Business Journey</h3>
            <p>
              Join our platform as a service provider. Connect with customers,
              grow your business, and manage bookings effortlessly.
            </p>
          </div>
        </div>

        <div className="form-section">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h2>Service Provider Signup</h2>

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

            <div className="divider">
              <span>OR</span>
            </div>

            <div>
              <label htmlFor="businessName">Business Name:</label>
              <input
                id="businessName"
                type="text"
                placeholder="Enter your business name"
                {...register("businessName", {
                  required: "Business name is required",
                })}
              />
              {errors.businessName && (
                <span>{errors.businessName.message}</span>
              )}
            </div>

            <div>
              <label htmlFor="email">Email:</label>
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
              {errors.email && <span>{errors.email.message}</span>}
            </div>

            <div>
              <label htmlFor="password">Password:</label>
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
              {errors.password && <span>{errors.password.message}</span>}
            </div>

            <div>
              <label htmlFor="serviceType">Service Type:</label>
              <select
                id="serviceType"
                {...register("serviceType", {
                  required: "Please select a service type",
                })}
              >
                <option value="">Select a service</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
              {errors.serviceType && <span>{errors.serviceType.message}</span>}
            </div>

            <div>
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
              {/* {userLocation && (
              <div className="location-info">
                📍 Lat: {userLocation.latitude.toFixed(4)}, Lng:{" "}
                {userLocation.longitude.toFixed(4)}
              </div>
            )} */}
            </div>

            <div>
              <button type="submit">Sign Up as Provider</button>
            </div>

            <div className="login-link">
              <span>Have an account already? </span>
              <a href="/serviceProvider/login" className="login-link-text">
                Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
