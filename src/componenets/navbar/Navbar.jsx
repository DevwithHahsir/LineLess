import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig/firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";

function Navbar({ isProvider = false }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);

      // Force a complete page reload to clear any cached state
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

            {user && (
              <li className="nav-item">
                <Link
                  to={
                    isProvider
                      ? "/service/Servicedashboard"
                      : "/client/clientdashboard"
                  }
                  className={`nav-link ${
                    isActive(
                      isProvider
                        ? "/service/Servicedashboard"
                        : "/client/clientdashboard"
                    )
                      ? "active"
                      : ""
                  }`}
                  onClick={closeMenu}
                >
                  {isProvider ? "Provider Dashboard" : "Dashboard"}
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center">
            {loading ? (
              <span className="text-white me-3">Loading...</span>
            ) : user ? (
              <>
                <span className="text-white me-3">
                  {isProvider ? "" : ""}
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-light btn-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/user/login"
                  className="btn btn-outline-light btn-sm me-2"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
                <Link
                  to="/provider/login"
                  className="btn btn-outline-warning btn-sm me-2"
                  onClick={closeMenu}
                >
                  Service Provider
                </Link>
                <Link
                  to="/user/signup"
                  className="btn btn-outline-success btn-sm"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
