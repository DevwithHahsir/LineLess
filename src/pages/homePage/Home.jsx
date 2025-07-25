import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

function Home() {
  const navigate = useNavigate();

  const handleClientSignup = () => {
    navigate("/user/signup");
  };

  const handleProviderSignup = () => {
    navigate("/provider/signup");
  };

  return (
    <>
    <div className="main-page-container">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome to LineLess</h1>
        <p className="welcome-subtitle">Skip the lines, save your time</p>
        <p className="welcome-description">
          Join our platform to either find services quickly as a client or offer
          your services as a provider. Choose your role below to get started.
        </p>
      </div>

      <div className="user-type-selection">
        <div
          className="user-type-card client-card"
          onClick={handleClientSignup}
        >
          <span className="card-icon">👤</span>
          <h2 className="card-title">I'm a Client</h2>
          <p className="card-description">
            Looking for services? Browse and book appointments with service
            providers in your area.
          </p>
          <button className="signup-button">Sign Up as Client</button>
        </div>

        <div
          className="user-type-card provider-card"
          onClick={handleProviderSignup}
        >
          <span className="card-icon">🔧</span>
          <h2 className="card-title">I'm a Service Provider</h2>
          <p className="card-description">
            Offer your services? Connect with clients and manage your
            appointments efficiently.
          </p>
          <button className="signup-button">Sign Up as Provider</button>
        </div>
      </div>
    </div>
    </>
  );
}

export default Home;
