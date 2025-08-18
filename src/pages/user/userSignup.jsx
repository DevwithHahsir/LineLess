import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "./userSignup.css";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { googleProvider } from "../../firebaseConfig/firebase";
import { auth } from "../../firebaseConfig/firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig/firebase";

export default function UserSignup() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      const userData = {
        fullName: data.username,
        phone: data.phone,
        email: data.email,
        password: data.password,
        location: userLocation || null,
        createdAt: new Date(),
        role: "user", // Add role for permission management
        userType: "client", // Add user type for identification
      };

      await setDoc(doc(db, "userSignup", user.uid), userData);

      // Also create a document in the central users collection for role management
      // await setDoc(doc(db, "users", user.uid), {
      //   email: data.email,
      //   role: "user",
      //   userType: "client",
      //   createdAt: new Date(),
      //   uid: user.uid,
      // });

      alert("Account created successfully! Welcome to LineLess!");

      // Navigate to client dashboard
      navigate("/client/clientdashboard");
    } catch (error) {
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
      // Use popup with proper error handling
      await signInWithPopup(auth, googleProvider);
      alert("Google signup successful! Welcome to LineLess!");

      // Navigate to client dashboard
      navigate("/client/clientdashboard");
    } catch (error) {
      alert(`Google sign-in error: ${error.message}`);
    }
  };

  return (
    <>
      <div className="form-main-container">


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



            <div className="label-input">
              
              <input
                id="username"
                type="text"
                placeholder="Enter your Name"
                {...register("username", { required: "Username is required" })}
              />
              {errors.username && <span>{errors.username.message}</span>}
            </div>

            <div className="label-input">
              
              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: "Please enter a valid phone number",
                  },
                })}
              />
              {errors.phone && <span>{errors.phone.message}</span>}
            </div>

            <div className="label-input">
              
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

            <div className="label-input">
             
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

            <div className="Location-btn">
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

            <div className="form-sub-btn">
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
