import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig/firebase";
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
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
    //   navigate("/");
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

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">

      <div className="navbar-container">


        <div className="nav-logo-container">

        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          LineLess
        </Link>

        </div>



        <div className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          <div className="navbar-nav">
            <Link
              to="/"
              className={`navbar-link ${isActive("/") ? "active" : ""}`}
              onClick={closeMenu}
            >
              Home
            </Link>

            <Link
              to="/map-test"
              className={`navbar-link ${isActive("/map-test") ? "active" : ""}`}
              onClick={closeMenu}
            >
              Map
            </Link>

            {user && (
              <>
                <Link
                  to="/client/clientdashboard"
                  className={`navbar-link ${
                    isActive("/client/clientdashboard") ? "active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>
          </div>

          <div className="navbar-auth">
            {loading ? (
              <div className="navbar-loading">Loading...</div>
            ) : user ? (
              <div className="navbar-user">
                <div className="user-info">
                  <span className="user-email">{user.email}</span>
                </div>
                <div className="user-actions">
                  <button
                    onClick={handleLogout}
                    className="navbar-button logout-btn"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="navbar-guest">
                <Link
                  to="/user/login"
                  className="navbar-button login-btn"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
                <Link
                  to="/provider/login"
                  className="navbar-button provider-btn"
                  onClick={closeMenu}
                >
                  Service Provider
                </Link>
                <Link
                  to="/user/signup"
                  className="navbar-button signup-btn"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        

        <div className="navbar-toggle" onClick={toggleMenu}>
          <span className="toggle-bar">hello</span>
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
