import { useNavigate } from "react-router-dom";
import React from "react";
import "./home.css";
import TextType from "../../componenets/animations/TextType";
import { CiUser } from "react-icons/ci";
import { BsBuildings } from "react-icons/bs";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="choose-journey">
      <TextType
        text={[
          "Timeless – Where Every Moment Lasts Forever.",
          "Built for Today, Meant for Eternity.",
          "Your Story. Your Legacy. Timeless.",
        ]}
        typingSpeed={75}
        pauseDuration={1500}
        showCursor={true}
        cursorCharacter="|"
      />
      <p className="subtitle">
        Whether you're looking to discover amazing services or ready to share
        your expertise with the world, we have the perfect path for you.
      </p>
      <p className="trusted-text">Trusted by 100,000+ users worldwide →</p>

      <div className="cards-container">
        {/* User Card */}
        <div className="card">
          <h3>
            <CiUser className="homePage-icon" /> User
          </h3>
          <p>
            Discover and book amazing services from verified providers in your
            area.
          </p>
          <ul>
            <li>Browse thousands of services</li>
            <li>No Waiting in Physical Queues</li>
            <li>Secure booking system</li>
            <li>Book Anytime, Anywhere</li>
            <li>No Waiting in Physical Queues</li>
          </ul>
          <button onClick={() => navigate("/user/login")}>
            Get Started as User
          </button>
        </div>

        {/* Provider Card */}
        <div className="card">
          <h3>
            <BsBuildings className="homePage-icon" /> Provider
          </h3>
          <p>
            Share your skills and grow your business with our powerful platform.
          </p>
          <ul>
            <li>Create detailed service listings</li>
            <li>Manage bookings efficiently</li>
            <li>Build your reputation</li>
            <li>Flexible pricing options</li>
            <li>Marketing tools included</li>
          </ul>
          <button onClick={() => navigate("/provider/login")}>
            Get Started as Provider
          </button>
        </div>
      </div>

      <div className="learn-more">
        <button>Learn More About Our Platform</button>
      </div>
    </div>
  );
};

export default Home;
