import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { googleProvider } from "../../firebaseConfig/firebase";
import { auth } from "../../firebaseConfig/firebase";
import "./providerLogin.css";

export default function ProviderLogin() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);

      alert("Login successful! Welcome back to your provider dashboard!");

      // Navigate to service provider dashboard
      navigate("/service/Servicedashboard");
    } catch (error) {
      let errorMessage = "Login failed: ";
      if (error.code === "auth/user-not-found") {
        errorMessage +=
          "No provider account found with this email. Please sign up first.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage += "Invalid password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage += "Invalid email address format.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage += "Too many failed attempts. Please try again later.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage += "Network error. Please check your internet connection.";
      } else {
        errorMessage += error.message;
      }

      alert(errorMessage);
    }
  };

  const handleForgotPassword = async () => {
    const email = prompt(
      "Please enter your email address to reset your password:"
    );

    if (!email) {
      return;
    }

    if (!/^\S+@\S+$/i.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      // Configure action code settings for password reset
      const actionCodeSettings = {
        url: window.location.origin + "/provider/login", // URL to redirect back to after reset
        handleCodeInApp: false, // This must be false for email link
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      alert(
        "Password reset email sent successfully! Please check your inbox (including spam/junk folder) and follow the instructions to reset your password. The email may take a few minutes to arrive."
      );
    } catch (error) {
      let errorMessage = "Failed to send password reset email: ";
      if (error.code === "auth/user-not-found") {
        errorMessage +=
          "No provider account found with this email address. Please check your email or sign up for a new account.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage += "Invalid email address format.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage +=
          "Too many requests. Please wait a few minutes before trying again.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage +=
          "Network error. Please check your internet connection and try again.";
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage +=
          "Password reset is not enabled. Please contact support.";
      } else {
        errorMessage += error.message;
      }
      alert(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Use popup with proper error handling
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google login successful", result);
      alert(
        "Google login successful! Welcome back to your provider dashboard!"
      );

      // Navigate to service provider dashboard
      navigate("/service/Servicedashboard");
    } catch (error) {
      console.error("Google login error:", error);
      alert(`Google login failed: ${error.message}`);
    }
  };

  return (
    <>
      <div className="form-main-container">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2>Service Provider Login</h2>

          {/* Google Sign-in Button */}
          <div className="google-auth-container">
            <button
              type="button"
              className="google-signin-btn"
              onClick={handleGoogleLogin}
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
              })}
            />
            {errors.password && <span>{errors.password.message}</span>}
          </div>

          <div>
            <button type="submit">Login as Provider</button>
          </div>

          <div className="forgot-password">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="forgot-password-link"
            >
              Forgot Password?
            </button>
          </div>

          <div className="login-link">
            <span>Don't have a provider account? </span>
            <a href="/provider/signup" className="login-link-text">
              Sign Up
            </a>
          </div>
        </form>
      </div>
    </>
  );
}
