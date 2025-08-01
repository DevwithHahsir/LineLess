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

// Business type mappings
const businessTypeMappings = {
  bank: {
    icon: FaBuilding,
    displayName: "Banks & Finance",
    description: "Banks, insurance offices, loan centers",
    color: "#1976d2",
  },
  salon: {
    icon: FaCut,
    displayName: "Salons & Beauty",
    description: "Hair salons, beauty parlors, spas",
    color: "#e91e63",
  },
  clinic: {
    icon: FaHospital,
    displayName: "Healthcare & Clinics",
    description: "Medical clinics, hospitals, healthcare",
    color: "#4caf50",
  },
  government: {
    icon: FaUniversity,
    displayName: "Government Offices",
    description: "Government offices, municipal services",
    color: "#ff9800",
  },
  other: {
    icon: FaStore,
    displayName: "Other Services",
    description: "Various other business services",
    color: "#9c27b0",
  },
};

function ListServices() {
  const [businessCategories, setBusinessCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Handle appointment booking
  const handleBookAppointment = (event, business) => {
    event.preventDefault();
    event.stopPropagation();
    alert(
      `Booking appointment for ${business.displayName}\nPhone: ${
        business.phone || "N/A"
      }\nAddress: ${business.physicalAddress}`
    );
  };

  // Get business info from type
  const getBusinessInfo = (type) => {
    return (
      businessTypeMappings[type] || {
        icon: FaEllipsisH,
        displayName: "Services",
        description: "Business services",
        color: "#666",
      }
    );
  };

  // Reverse geocode function
  const reverseGeocode = async (lat, lng) => {
    try {
      const API_KEY = "f84ab7e3e4c144a092715c1baee472fd";
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat},${lng}&key=${API_KEY}`
      );

      if (response.data?.results?.length > 0) {
        return response.data.results[0].formatted;
      }
      return "Address not found";
    } catch (error) {
      console.error("Geocoding error:", error);
      return "Address not available";
    }
  };

  // Fetch business data
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true);

        // Fetch real data from Firebase
        const querySnapshot = await getDocs(
          collection(db, "BusinessProviderForm")
        );
        const businesses = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Process each business
        const processedBusinesses = await Promise.all(
          businesses.map(async (business) => {
            const displayName =
              business.businessName ||
              business.name ||
              business.companyName ||
              business.serviceName ||
              "Unnamed Business";

            let physicalAddress = "Address not available";

            if (business.latitude && business.longitude) {
              physicalAddress = await reverseGeocode(
                business.latitude,
                business.longitude
              );
            } else if (business.address) {
              physicalAddress = business.address;
            }

            return {
              ...business,
              displayName,
              physicalAddress,
              currentCount:
                business.currentCount || Math.floor(Math.random() * 15) + 1,
            };
          })
        );

        // Group businesses by type
        const grouped = processedBusinesses.reduce((acc, business) => {
          const type = business.businessType || business.type || "other";
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
          acc[type].totalCurrentCount += business.currentCount;
          return acc;
        }, {});

        // Calculate average wait time
        Object.values(grouped).forEach((category) => {
          category.avgWaitTime = Math.max(5, category.totalCurrentCount * 2);
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

  // Toggle category expansion
  const toggleCategory = (type) => {
    setExpandedCategory(expandedCategory === type ? null : type);
  };

  if (loading) {
    return (
      <div className="service-loading-container">
        <div className="service-spinner"></div>
        <p>Loading services and addresses...</p>
      </div>
    );
  }

  if (businessCategories.length === 0) {
    return (
      <div className="service-no-services">
        <div className="service-empty-state">
          <FaEllipsisH className="service-empty-icon" />
          <h3>No Services Available</h3>
          <p>
            There are currently no services in your area. Please check back
            later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="service-list-wrapper">
      <div className="service-header-section">
        <h1>Available Services</h1>
        <p>Browse and book appointments with local businesses</p>
      </div>

      <div className="service-category-grid">
        {businessCategories.map((category) => {
          const {
            icon: IconComponent,
            displayName,
            description,
            color,
          } = getBusinessInfo(category.type);
          const isExpanded = expandedCategory === category.type;

          return (
            <div
              key={category.type}
              className={`service-category-card ${
                isExpanded ? "service-expanded" : ""
              }`}
              onClick={() => toggleCategory(category.type)}
              style={{ borderColor: color }}
            >
              <div className="service-card-header">
                <div
                  className="service-icon-box"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <IconComponent className="service-icon" style={{ color }} />
                </div>
                <span
                  className="service-active-badge"
                  style={{ backgroundColor: color }}
                >
                  {category.count} active
                </span>
              </div>

              <h3 className="service-category-title">{displayName}</h3>
              <p className="service-category-description">{description}</p>

              <div className="service-stats-container">
                <div className="service-stat-item">
                  <FaClock className="service-stat-icon" />
                  <div>
                    <span>Avg wait</span>
                    <strong>{category.avgWaitTime} min</strong>
                  </div>
                </div>

                <div className="service-stat-item">
                  <FaUsers className="service-stat-icon" />
                  <div>
                    <span>In queue</span>
                    <strong>{category.totalCurrentCount}</strong>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="service-business-locations">
                  {category.businesses.map((business) => (
                    <div key={business.id} className="service-business-item">
                      <div className="service-business-header">
                        <h4 className="service-business-name">
                          {business.displayName}
                        </h4>
                        <span className="service-queue-count">
                          {business.currentCount} in queue
                        </span>
                      </div>

                      <div className="service-business-location">
                        <FaMapMarkerAlt className="service-location-icon" />
                        <span className="service-location-text">
                          {business.physicalAddress}
                        </span>
                      </div>

                      <div className="service-business-details">
                        {business.phoneNumber && (
                          <div className="service-detail-item">
                            <span className="service-detail-label">Phone:</span>
                            <span className="service-detail-value">
                              {business.phoneNumber}
                            </span>
                          </div>
                        )}

                        {business.email && (
                          <div className="service-detail-item">
                            <span className="service-detail-label">Email:</span>
                            <span className="service-detail-value">
                              {business.email}
                            </span>
                          </div>
                        )}

                        {business.openingTime && business.closingTime && (
                          <div className="service-detail-item">
                            <span className="service-detail-label">Hours:</span>
                            <span className="service-detail-value">
                              {business.openingTime} - {business.closingTime}
                            </span>
                          </div>
                        )}

                        {business.city && (
                          <div className="service-detail-item">
                            <span className="service-detail-label">City:</span>
                            <span className="service-detail-value">
                              {business.city}
                            </span>
                          </div>
                        )}

                        {business.businessType && (
                          <div className="service-detail-item">
                            <span className="service-detail-label">Type:</span>
                            <span className="service-detail-value">
                              {business.businessType}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        className="service-book-appointment-btn"
                        onClick={(e) => handleBookAppointment(e, business)}
                        style={{ backgroundColor: color }}
                      >
                        📅 Book Appointment
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="service-expand-indicator">
                {isExpanded ? "Show Less" : "Show Businesses"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ListServices;
