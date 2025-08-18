/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig/firebase";
import { useAuth } from "../../authContext/useAuth";

import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";
import { CiUser } from "react-icons/ci";
import {
  FiHome,
  FiGrid,
  FiCalendar,
  FiLogOut,
  FiUser,
  FiUserCheck,
} from "react-icons/fi";

function Navbar({ isProvider = false }) {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth).catch(() => {});
    window.location.href = "/";
  };
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;
  const isClient = !!(
    user && ["user", "client"].includes((user.role || "").toLowerCase())
  );
  const dashboardPath = user
    ? isClient
      ? "/client/clientdashboard"
      : "/service/Servicedashboard"
    : null;

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
                className={`nav-link nav-flex ${isActive("/") ? "active" : ""}`}
                onClick={closeMenu}
              >
                <span className="icon-text-row">
                  <FiHome className="nav-icon" /> <span>Home</span>
                </span>
              </Link>
            </li>

            {dashboardPath && (
              <li className="nav-item">
                <Link
                  to={dashboardPath}
                  className={`nav-link nav-flex ${
                    isActive(dashboardPath) ? "active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  <span className="icon-text-row">
                    <FiGrid className="nav-icon" /> <span>Dashboard</span>
                  </span>
                </Link>
              </li>
            )}

            {isClient ? (
              <li className="nav-item">
                <Link
                  to="/appointments"
                  className={`nav-link nav-flex ${
                    isActive("/appointments") ? "active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  <span className="icon-text-row">
                    <FiCalendar className="nav-icon" />{" "}
                    <span>Appointments</span>
                  </span>
                </Link>
              </li>
            ) : (
              ""
            )}

            {shouldShowUser && <></>}
          </ul>

          <div className="d-flex align-items-center">
            {shouldShowUser ? (
              <>
                <span className="text-white me-3 user-email-role">
                  <span className="badge bg-secondary ms-2"><CiUser className="user-icon"/>{user.role}</span>
                  {/* <span className="ms-2">{user.email}</span> */}
                </span>

                <button
                  onClick={handleLogout}
                  className="btn btn-outline-light btn-sm logout nav-flex"
                >
                  
                    <FiLogOut className="nav-icon" /> <span>Logout</span>
                  
                </button>
              </>
            ) : (
              <>
                <div className="auth-btns">
                  <Link
                    to="/user/login"
                    className="btn btn-outline-light btn-sm me-2 sign-in nav-flex"
                    onClick={closeMenu}
                  >
                    <span className="icon-text-row">
                      <FiUser className="nav-icon" />{" "}
                      <span>Client Sign In</span>
                    </span>
                  </Link>
                  <Link
                    to="/provider/login"
                    className="btn btn-outline-warning btn-sm me-2 provider-sign-in nav-flex"
                    onClick={closeMenu}
                  >
                    <span className="icon-text-row">
                      <FiUserCheck className="nav-icon" />{" "}
                      <span>Provider Sign In</span>
                    </span>
                  </Link>
                  <Link
                    to="/user/signup"
                    className="btn btn-outline-success btn-sm sign-up nav-flex"
                    onClick={closeMenu}
                  >
                    <span className="icon-text-row">
                      <FiUser className="nav-icon" /> <span>Sign Up</span>
                    </span>
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
