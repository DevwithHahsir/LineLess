import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "./userSignup.css";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { googleProvider } from "../../firebaseConfig/firebase";
import { auth } from "../../firebaseConfig/firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig/firebase";

export default function UserSignup() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log("🔄 Starting signup process...");
    console.log("📋 Form data:", data);

    try {
      console.log("🔐 Creating user with email and password...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;
      console.log("✅ User created in Auth:", user.uid);

      console.log("💾 Saving user data to Firestore...");
      const userData = {
        fullName: data.username,
        phone: data.phone,
        email: data.email,
        password: data.password,
        location: userLocation || null,
        createdAt: new Date(),
      };
      console.log("📊 User data to save:", userData);

      await setDoc(doc(db, "userSignup", user.uid), userData);

      console.log("✅ User signed up and saved to Firestore:", user.uid);
      alert("Account created successfully! Welcome to LineLess!");

      // Navigate to a dashboard or home page instead of login
      // navigate("/user/dashboard"); // Uncomment when you have a dashboard
    } catch (error) {
      console.error("❌ Detailed error:", error);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error message:", error.message);

      // More specific error messages
      let errorMessage = "Signup failed: ";
      if (error.code === "auth/email-already-in-use") {
        errorMessage +=
          "This email is already registered. Try logging in instead.";
      } else if (error.code === "auth/weak-password") {
        errorMessage +=
          "Password is too weak. Please choose a stronger password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage += "Invalid email address format.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage += "Network error. Please check your internet connection.";
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
          console.log("Location captured:", locationData);
        },
        (error) => {
          console.error("Error getting location:", error);
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
    // TODO: Implement Google authentication
    // console.log("Google signup clicked");
    // You can integrate with Firebase Auth, Google OAuth, or any other service

    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("User signed in:", result.user);
      // You can save user data to Firestore here if needed
    } catch (error) {
      console.error("Google sign-in error:", error.message);
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
              {/* User signup illustration */}
              <defs>
                <linearGradient
                  id="userGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>

              {/* Background circle */}
              <circle
                cx="150"
                cy="150"
                r="140"
                fill="url(#userGradient)"
                opacity="0.1"
              />

              {/* Person icon */}
              <circle cx="150" cy="120" r="30" fill="url(#userGradient)" />
              <path
                d="M100 200 Q100 170 150 170 Q200 170 200 200 L200 220 Q200 230 190 230 L110 230 Q100 230 100 220 Z"
                fill="url(#userGradient)"
              />

              {/* Location pin */}
              <path
                d="M80 80 Q80 65 95 65 Q110 65 110 80 Q110 90 95 105 Q80 90 80 80 Z"
                fill="#ff4757"
              />
              <circle cx="95" cy="80" r="5" fill="white" />

              {/* Phone icon */}
              <rect
                x="210"
                y="70"
                width="25"
                height="40"
                rx="5"
                fill="#2f3542"
              />
              <rect
                x="213"
                y="75"
                width="19"
                height="25"
                rx="2"
                fill="#a4b0be"
              />
              <circle cx="222.5" cy="105" r="2" fill="#2f3542" />

              {/* Email envelope */}
              <rect
                x="60"
                y="210"
                width="40"
                height="30"
                rx="3"
                fill="#3742fa"
              />
              <path
                d="M60 210 L80 225 L100 210"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />

              {/* Security shield */}
              <path
                d="M210 210 Q210 200 220 200 Q230 200 230 210 L230 230 Q230 240 220 240 Q210 240 210 230 Z"
                fill="#2ed573"
              />
              <path
                d="M216 220 L219 223 L224 218"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />

              {/* Connecting lines */}
              <path
                d="M95 105 Q120 140 150 150"
                stroke="url(#userGradient)"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
                strokeDasharray="5,5"
              />
              <path
                d="M210 80 Q180 110 150 150"
                stroke="url(#userGradient)"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
                strokeDasharray="5,5"
              />
              <path
                d="M80 225 Q110 200 150 180"
                stroke="url(#userGradient)"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
                strokeDasharray="5,5"
              />
              <path
                d="M220 210 Q185 185 150 180"
                stroke="url(#userGradient)"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
                strokeDasharray="5,5"
              />
            </svg>

            <h3>Join LineLess Today!</h3>
            <p>
              Create your account to access services without the wait. Get
              instant access to local service providers.
            </p>
          </div>
        </div>

        <div className="form-section">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h2>User Signup</h2>

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
              <label htmlFor="username">Username:</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                {...register("username", { required: "Username is required" })}
              />
              {errors.username && <span>{errors.username.message}</span>}
            </div>

            <div>
              <label htmlFor="phone">Phone Number:</label>
              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[+]?[1-9][\d]{0,15}$/,
                    message: "Please enter a valid phone number",
                  },
                })}
              />
              {errors.phone && <span>{errors.phone.message}</span>}
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
              <button type="submit">Sign Up</button>
            </div>

            <div className="login-link">
              <span>Have an account already? </span>
              <a href="/user/login" className="login-link-text">
                Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
