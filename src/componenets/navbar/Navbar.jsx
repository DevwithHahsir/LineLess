/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig/firebase";
import { useAuth } from "../../authContext/useAuth";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";

function Navbar({ isProvider = false }) {
  const { user } = useAuth();
  // if (user) {
  //   console.log("User logged in:", {
  //     role: user.role,
  //     email: user.email,
  //   });
  // }
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Show user info and both dashboards for any logged-in user
  const shouldShowUser = !!user;

  return (
    <nav className="navbar navbar-expand-lg bg-dark px-3">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          LineLess
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}
          id="navbarNav"
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                to="/"
                className={`nav-link ${isActive("/") ? "active" : ""}`}
                onClick={closeMenu}
              >
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/map-test"
                className={`nav-link ${isActive("/map-test") ? "active" : ""}`}
                onClick={closeMenu}
              >
                Map
              </Link>
            </li>

            {shouldShowUser && (
              <>
                {/* <li className="nav-item">
                  <Link
                    to="/client/clientdashboard"
                    className={`nav-link ${
                      isActive("/client/clientdashboard") ? "active" : ""
                    }`}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                </li> */}
                {/* <li className="nav-item">
                  <Link
                    to="/service/Servicedashboard"
                    className={`nav-link ${
                      isActive("/service/Servicedashboard") ? "active" : ""
                    }`}
                    onClick={closeMenu}
                  >
                    Provider Dashboard
                  </Link>
                </li> */}
              </>
            )}
          </ul>

          <div className="d-flex align-items-center">
            {shouldShowUser ? (
              <>
              

                <span className="text-white me-3 user-email-role">
                  
                  <span className="badge bg-secondary ms-2">{user.role}</span>
                  {/* <span className="ms-2">{user.email}</span> */}
                </span>

                <button
                  onClick={handleLogout}
                  className="btn btn-outline-light btn-sm logout"
                  >
                  Logout
                </button>
                  
              </>
            ) : (
              <>
              <div className="auth-btns">

                <Link
                  to="/user/login"
                  className="btn btn-outline-light btn-sm me-2 sign-in"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
                <Link
                  to="/provider/login"
                  className="btn btn-outline-warning btn-sm me-2 change-dash-btn"
                  onClick={closeMenu}
                >
                  Service Provider
                </Link>
                <Link
                  to="/user/signup"
                  className="btn btn-outline-success btn-sm sign-up"
                  onClick={closeMenu}
                  >
                  Sign Up
                </Link>
                  </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
