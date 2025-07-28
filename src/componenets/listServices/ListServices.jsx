import React, { useState, useEffect } from "react";
import "./listServicess.css";
import {
  FaBuilding,
  FaClock,
  FaUsers,
  FaCut,
  FaHospital,
  FaUniversity,
  FaStore,
  FaEllipsisH,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { db } from "../../firebaseConfig/firebase";
import { collection, getDocs } from "firebase/firestore";
import axios from "axios";

function ListServices() {
  const [businessCategories, setBusinessCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState(new Set());

  // Handle card expansion/collapse
  const toggleCardExpansion = (categoryType) => {
    console.log("🔄 Toggling card:", categoryType);
    console.log("📋 Current expanded cards:", Array.from(expandedCards));

    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(categoryType)) {
      console.log("📥 Collapsing card:", categoryType);
      newExpandedCards.delete(categoryType);
    } else {
      console.log("📤 Expanding card:", categoryType);
      newExpandedCards.add(categoryType);
    }

    console.log("📋 New expanded cards:", Array.from(newExpandedCards));
    setExpandedCards(newExpandedCards);
  };

  // Handle appointment booking
  const handleBookAppointment = (business) => {
    console.log("📅 Booking appointment for:", business.displayName);
    // Here you can add your appointment booking logic
    alert(
      `Booking appointment for ${business.displayName}\nPhone: ${
        business.phone || "N/A"
      }\nAddress: ${business.physicalAddress}`
    );
  };

  const getBusinessIcon = (type) => {
    const iconMap = {
      bank: FaBuilding,
      salon: FaCut,
      clinic: FaHospital,
      government: FaUniversity,
      other: FaStore,
    };
    return iconMap[type] || FaEllipsisH;
  };

  const getBusinessDisplayName = (type) => {
    const nameMap = {
      bank: "Banks & Finance",
      salon: "Salons & Beauty",
      clinic: "Healthcare & Clinics",
      government: "Government Offices",
      other: "Other Services",
    };
    return nameMap[type] || "Services";
  };

  const getBusinessDescription = (type) => {
    const descriptionMap = {
      bank: "Banks, insurance offices, loan centers",
      salon: "Hair salons, beauty parlors, spas",
      clinic: "Medical clinics, hospitals, healthcare",
      government: "Government offices, municipal services",
      other: "Various other business services",
    };
    return descriptionMap[type] || "Business services";
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const API_KEY = "f84ab7e3e4c144a092715c1baee472fd"; // Use your API key
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat},${lng}&key=${API_KEY}`
      );

      if (
        response.data &&
        response.data.results &&
        response.data.results.length > 0
      ) {
        return response.data.results[0].formatted;
      } else {
        return "Address not found";
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      return "Address not available";
    }
  };

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(
          collection(db, "BusinessProviderForm")
        );
        const businesses = [];

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          console.log("📊 Business document data:", {
            id: doc.id,
            businessName: data.businessName,
            name: data.name,
            companyName: data.companyName,
            type: data.type,
            allFields: Object.keys(data),
          });

          const business = { id: doc.id, ...data };

          // Ensure business name is properly set - check multiple possible field names
          business.displayName =
            data.businessName ||
            data.name ||
            data.companyName ||
            data.serviceName ||
            "Unnamed Business";

          console.log(
            `✅ Business: ${business.displayName} (Type: ${business.type})`
          );

          if (data.latitude && data.longitude) {
            console.log(`🔍 Geocoding address for: ${business.displayName}`);
            const address = await reverseGeocode(data.latitude, data.longitude);
            business.physicalAddress = address;
          } else if (data.address) {
            business.physicalAddress = data.address;
          } else {
            business.physicalAddress = "Address not available";
          }

          businesses.push(business);
        }

        console.log(`✅ Total businesses fetched: ${businesses.length}`);
        console.log("📋 Business names summary:");
        businesses.forEach((business, index) => {
          console.log(
            `${index + 1}. ${business.displayName} (Type: ${business.type})`
          );
        });

        const grouped = businesses.reduce((acc, business) => {
          const type = business.type;
          if (!acc[type]) {
            acc[type] = {
              type: type,
              count: 0,
              businesses: [],
              totalCurrentCount: 0,
              avgWaitTime: 0,
            };
          }
          acc[type].count += 1;
          acc[type].businesses.push(business);
          acc[type].totalCurrentCount += business.currentCount || 0;
          return acc;
        }, {});

        Object.keys(grouped).forEach((type) => {
          const cat = grouped[type];
          cat.avgWaitTime = Math.max(5, cat.totalCurrentCount * 2);
        });

        setBusinessCategories(Object.values(grouped));
      } catch (error) {
        console.error("Error fetching businesses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading services and addresses...</p>
      </div>
    );
  }

  if (businessCategories.length === 0) {
    return (
      <div className="no-services">
        <p>No services available in your area.</p>
      </div>
    );
  }

  return (
    <div className="services-container">
      {businessCategories.map((category) => {
        const IconComponent = getBusinessIcon(category.type);

        return (
          <div
            key={category.type}
            className={`category-card ${
              expandedCards.has(category.type) ? "expanded" : ""
            }`}
            onClick={() => toggleCardExpansion(category.type)}
            style={{ cursor: "pointer" }}
          >
            <div className="card-header">
              <div className="icon-box">
                <IconComponent className="icon" />
              </div>
              <span className="active-badge">{category.count} active</span>
            </div>

            <h3 className="category-title">
              {getBusinessDisplayName(category.type)}
            </h3>
            <p className="category-description">
              {getBusinessDescription(category.type)}
            </p>

            {/* Show business details only when card is expanded */}
            {expandedCards.has(category.type) && (
              <div className="business-locations">
                {category.businesses.map((business) => (
                  <div key={business.id} className="business-item">
                    <div className="business-header">
                      <h4 className="business-name">
                        {business.displayName ||
                          business.businessName ||
                          business.name ||
                          "Business Name"}
                      </h4>
                      <span className="queue-count">
                        {business.currentCount || 0} in queue
                      </span>
                    </div>

                    <div className="business-location">
                      <FaMapMarkerAlt className="location-icon" />
                      <span className="location-text">
                        {business.physicalAddress}
                      </span>
                    </div>

                    {/* Additional business information */}
                    {business.phone && (
                      <div className="business-info">
                        <span className="info-label">📞 Phone:</span>
                        <span className="info-value">{business.phone}</span>
                      </div>
                    )}

                    {business.email && (
                      <div className="business-info">
                        <span className="info-label">📧 Email:</span>
                        <span className="info-value">{business.email}</span>
                      </div>
                    )}

                    {business.openTime && business.closeTime && (
                      <div className="business-info">
                        <span className="info-label">🕒 Hours:</span>
                        <span className="info-value">
                          {business.openTime} - {business.closeTime}
                        </span>
                      </div>
                    )}

                    {business.city && (
                      <div className="business-city">
                        <span>{business.city}</span>
                      </div>
                    )}

                    {/* Book Appointment Button - Only shows when card is expanded */}
                    <div className="appointment-section">
                      <button
                        className="book-appointment-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card collapse when clicking button
                          handleBookAppointment(business);
                        }}
                      >
                        📅 Book Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Expansion indicator */}
            <div className="expansion-indicator">
              {expandedCards.has(category.type)
                ? "⬆️ Click to collapse"
                : "⬇️ Click to expand"}
            </div>

            <div className="card-footer">
              <div className="footer-item">
                <FaClock className="footer-icon" />
                <span>
                  Avg wait: <strong>{category.avgWaitTime} min</strong>
                </span>
              </div>
              <div className="footer-item">
                <FaUsers className="footer-icon" />
                <span>{category.totalCurrentCount}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ListServices;
