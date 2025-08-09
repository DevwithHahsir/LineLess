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
import { db, auth } from "../../firebaseConfig/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  increment,
  getDoc,
} from "firebase/firestore";
import axios from "axios";

// Business type mappings (updated)
const businessTypeMappings = {
  restaurant: {
    icon: FaStore,
    displayName: "Restaurant",
    description: "Restaurants, cafes, food courts",
    color: "#ff7043",
    tag: "Food & Dining",
  },
  "salon & beauty": {
    icon: FaCut,
    displayName: "Salon & Beauty",
    description: "Hair salons, beauty parlors, spas",
    color: "#e91e63",
    tag: "Beauty",
  },
  healthcare: {
    icon: FaHospital,
    displayName: "Healthcare",
    description: "Medical clinics, hospitals, healthcare",
    color: "#4caf50",
    tag: "Health",
  },
  automotive: {
    icon: FaBuilding,
    displayName: "Automotive",
    description: "Mechanics, car service, auto repair",
    color: "#607d8b",
    tag: "Auto",
  },
  "retail store": {
    icon: FaStore,
    displayName: "Retail Store",
    description: "Shops, stores, supermarkets",
    color: "#9c27b0",
    tag: "Retail",
  },
  "fitness & gym": {
    icon: FaUsers,
    displayName: "Fitness & Gym",
    description: "Gyms, fitness centers, yoga studios",
    color: "#00bcd4",
    tag: "Fitness",
  },
  education: {
    icon: FaUniversity,
    displayName: "Education",
    description: "Schools, colleges, coaching centers",
    color: "#3f51b5",
    tag: "Education",
  },
  banking: {
    icon: FaBuilding,
    displayName: "Banking",
    description: "Banks, finance, loan centers",
    color: "#1976d2",
    tag: "Finance",
  },
  "government office": {
    icon: FaUniversity,
    displayName: "Government Office",
    description: "Government offices, municipal services",
    color: "#ff9800",
    tag: "Government",
  },
  entertainment: {
    icon: FaStore,
    displayName: "Entertainment",
    description: "Cinemas, theaters, amusement parks",
    color: "#ffb300",
    tag: "Fun",
  },
  "professional services": {
    icon: FaEllipsisH,
    displayName: "Professional Services",
    description: "Consultants, legal, IT, business services",
    color: "#8bc34a",
    tag: "Professional",
  },
  other: {
    icon: FaStore,
    displayName: "Other",
    description: "Various other business services",
    color: "#757575",
    tag: "Other",
  },
};

function ListServices() {
  const [businessCategories, setBusinessCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Handle appointment booking
  const handleBookAppointment = async (event, business) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      // Show loading state
      const button = event.target;
      const originalText = button.textContent;
      button.textContent = "Booking...";
      button.disabled = true;

      // Get current user's data from Firebase
      let clientData = {
        name: "Guest User",
        email: "guest@example.com",
        userId: "guest",
      };

      // Get current user data if authenticated
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "userSignup", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            clientData = {
              name: userData.fullName || userData.username || "User",
              email: userData.email || currentUser.email,
              userId: currentUser.uid,
              phone: userData.phone || null,
            };
          }
        } catch (error) {
          console.log("Could not fetch user data, using defaults:", error);
        }
      } else {
        // If no user is logged in, prompt for basic info
        const userName = prompt("Please enter your name for the appointment:");
        if (!userName || userName.trim() === "") {
          alert("Name is required to book an appointment.");
          button.textContent = originalText;
          button.disabled = false;
          return;
        }
        clientData.name = userName.trim();
      }

      // Update the business count in database
      const businessRef = doc(db, "businessRegistrations", business.id);
      await updateDoc(businessRef, {
        count: increment(1),
      });

      // Get the updated count from database to ensure correct queue number
      const updatedBusinessDoc = await getDoc(businessRef);
      const updatedCount = updatedBusinessDoc.data()?.count || 0;

      // Create appointment record
      const appointmentData = {
        businessId: business.id,
        businessName: business.displayName,
        clientName: clientData.name,
        clientEmail: clientData.email,
        clientUserId: clientData.userId,
        clientPhone: clientData.phone || null,
        appointmentDate: new Date(),
        status: "pending",
        queueNumber: updatedCount, // Queue starts from 1 (first person gets 1, second gets 2, etc.)
      };

      await addDoc(collection(db, "appointments"), appointmentData);

      // Update local state to reflect the change
      setBusinessCategories((prevCategories) =>
        prevCategories.map((service) =>
          service.id === business.id
            ? { ...service, currentCount: updatedCount }
            : service
        )
      );

      alert(
        `Appointment booked successfully! You are #${updatedCount} in queue.`
      );

      // Reset button state
      button.textContent = originalText;
      button.disabled = false;
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment. Please try again.");

      // Reset button state on error
      const button = event.target;
      button.textContent = "📅 Book Appointment";
      button.disabled = false;
    }
  }; // Get business info from type
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
      const API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
      if (!API_KEY) {
        console.warn(
          "Missing VITE_OPENCAGE_API_KEY. Add it to your .env file (Vite) to enable reverse geocoding."
        );
        return "Address not available";
      }
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
        console.log("Fetching businesses from businessRegistrations...");

        // Fetch real data from Firebase - using the correct collection name
        const querySnapshot = await getDocs(
          collection(db, "businessRegistrations")
        );
        console.log("Found documents:", querySnapshot.size);

        const businesses = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Raw businesses data:", businesses);

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
            } else if (business.address || business.location) {
              physicalAddress = business.address || business.location;
            }

            // Fetch currentToken from business document, fallback to 0 if not present
            const currentToken =
              business.currentToken !== undefined ? business.currentToken : 0;

            return {
              ...business,
              displayName,
              physicalAddress,
              currentCount: business.count || 0, // Total booked tokens
              currentToken, // Current serving token
            };
          })
        );

        // Use new category keys for mapping
        const normalizeType = (type) => {
          if (!type) return "other";
          // Lowercase, trim, and collapse multiple spaces
          return type.toLowerCase().replace(/\s+/g, " ").trim();
        };

        const individualServices = processedBusinesses.map((business) => {
          const type =
            business.serviceCategory ||
            business.businessType ||
            business.type ||
            "other";
          const normalizedType = normalizeType(type);
          // Use the mapping key as is (e.g., "salon & beauty", "retail store")
          const mappedType = businessTypeMappings[normalizedType]
            ? normalizedType
            : "other";

          // Create individual service object with business info
          return {
            id: business.id,
            type: mappedType,
            originalCategory: type,
            displayName: business.displayName, // Business name
            physicalAddress: business.physicalAddress,
            currentCount: business.currentCount, // Total booked tokens
            currentToken:
              business.currentToken !== undefined ? business.currentToken : 0, // Ensure fallback to 0
            avgWaitTime: Math.max(5, business.currentCount * 2),
            phone: business.phone,
            email: business.email,
            openTime: business.openTime,
            closeTime: business.closeTime,
            businessDescription: business.businessDescription,
            maxCapacityPerHour: business.maxCapacityPerHour,
            // Add business info for icons and styling
            ...getBusinessInfo(mappedType),
            // Override description to use business description if available
            description:
              business.businessDescription ||
              getBusinessInfo(mappedType).description,
            // Add individual business details
            businesses: [business], // Keep the original structure for compatibility
            count: 1, // Individual business count
          };
        });

        console.log("Final processed individual services:", individualServices);
        setBusinessCategories(individualServices);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, []);

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  if (loading) {
    return (
      <div className="services-list-loading">
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div className="services-list-container">
      <div className="services-list-header">
        <h2>Available Services</h2>
        {/* <p>Browse and book appointments with local businesses</p> */}
      </div>

      <div className="service-category-grid">
        {businessCategories.map((service) => {
          const { icon: IconComponent, color } = getBusinessInfo(service.type);
          const isExpanded = expandedCategory === service.id;

          return (
            <div
              key={service.id}
              className={`service-category-card ${
                isExpanded ? "service-expanded" : ""
              }`}
              onClick={() => toggleCategory(service.id)}
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
                  {service.originalCategory}
                </span>
              </div>

              <h3 className="service-category-title">{service.displayName}</h3>
              <p className="service-category-description">
                {service.description}
              </p>

              {/* Show current serving token (from provider dashboard) */}
              <div
                className="service-token-info"
                style={{
                  marginBottom: "8px",
                  fontWeight: "bold",
                  color: color,
                }}
              >
                Current Token: {service.currentToken}
              </div>

              <div className="service-stats-container">
                <div className="service-stat-item">
                  <FaClock className="service-stat-icon" />
                  <div>
                    <span>Avg wait</span>
                    <strong>{service.avgWaitTime} min</strong>
                  </div>
                </div>

                <div className="service-stat-item">
                  <FaUsers className="service-stat-icon" />
                  <div>
                    <span>In queue</span>
                    <strong>{service.currentCount}</strong>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="service-business-details">
                  <div className="service-business-location">
                    <FaMapMarkerAlt className="service-location-icon" />
                    <span className="service-location-text">
                      {service.physicalAddress}
                    </span>
                  </div>

                  <div className="service-business-info">
                    {service.phone && (
                      <div className="service-detail-item">
                        <span className="service-detail-label">Phone:</span>
                        <span className="service-detail-value">
                          {service.phone}
                        </span>
                      </div>
                    )}

                    {service.email && (
                      <div className="service-detail-item">
                        <span className="service-detail-label">Email:</span>
                        <span className="service-detail-value">
                          {service.email}
                        </span>
                      </div>
                    )}

                    {service.openTime && service.closeTime && (
                      <div className="service-detail-item">
                        <span className="service-detail-label">Hours:</span>
                        <span className="service-detail-value">
                          {service.openTime} - {service.closeTime}
                        </span>
                      </div>
                    )}

                    {service.maxCapacityPerHour && (
                      <div className="service-detail-item">
                        <span className="service-detail-label">Capacity:</span>
                        <span className="service-detail-value">
                          {service.maxCapacityPerHour} per hour
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    className="service-book-appointment-btn"
                    onClick={(e) => handleBookAppointment(e, service)}
                    style={{ backgroundColor: color }}
                  >
                    📅 Book Appointment
                  </button>
                </div>
              )}

              <div className="service-expand-indicator">
                {isExpanded ? "Show Less" : "Show Details"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ListServices;
