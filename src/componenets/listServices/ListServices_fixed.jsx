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
import { collection, getDocs, query, where } from "firebase/firestore";
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
      const API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
      if (!API_KEY) {
        console
          .warn
          // "Missing VITE_OPENCAGE_API_KEY. Add it to your .env file (Vite) to enable reverse geocoding."
          ();
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

        // Fetch current token per business from appointments (serving or pending)
        let currentTokenByBiz = new Map();
        const ACTIVE_STATUSES = new Set([
          "serving",
          "current",
          "pending",
          "accepted",
          "ongoing",
        ]);
        const accumulate = (docs) => {
          // Helper to extract a number from mixed strings like "token1" or "tokken2"
          const toNumber = (val) => {
            if (typeof val === "number") return val;
            if (typeof val === "string") {
              const match = val.match(/\d+/);
              if (match) return Number(match[0]);
            }
            return NaN;
          };

          docs.forEach((d) => {
            const a = d.data();
            const bId = a.businessId;
            if (!bId) return;
            // Support multiple possible token fields
            const tokenCandidate =
              a.queueNumber ?? a.token ?? a.tokken ?? a.tokenNumber;
            const qnRaw = toNumber(tokenCandidate);
            const qn = Number.isFinite(qnRaw) ? qnRaw : Number.MAX_SAFE_INTEGER;
            const st = (a.status || "").toString().toLowerCase();
            if (!ACTIVE_STATUSES.has(st)) return;
            const existing = currentTokenByBiz.get(bId);
            if (existing === undefined || qn < existing) {
              currentTokenByBiz.set(bId, qn);
            }
          });
        };
        try {
          // Try indexed query first
          const apptQ = query(
            collection(db, "appointments"),
            where("status", "in", Array.from(ACTIVE_STATUSES))
          );
          const apptSnap = await getDocs(apptQ);
          accumulate(apptSnap);
        } catch (e) {
          // Likely missing index for 'in' query; fall back to fetching all and filtering client-side
          console.warn(
            "Falling back to client-side filter for appointments (consider adding an index):",
            e
          );
          const allApptsSnap = await getDocs(collection(db, "appointments"));
          accumulate(allApptsSnap);
        }

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

            return {
              ...business,
              displayName,
              physicalAddress,
              currentCount:
                business.currentCount || Math.floor(Math.random() * 15) + 1,
              currentToken: currentTokenByBiz.get(business.id) ?? 0,
            };
          })
        );

        // Instead of grouping, create individual service cards for each business
        const individualServices = processedBusinesses.map((business) => {
          // Map the serviceCategory from business form to the expected type
          const type =
            business.serviceCategory ||
            business.businessType ||
            business.type ||
            "other";
          const normalizedType = type.toLowerCase().replace(/\s+/g, "");

          // Map service categories to our business type keys for icons and styling
          const typeMapping = {
            restaurant: "other",
            "salon&beauty": "salon",
            healthcare: "clinic",
            automotive: "other",
            retailstore: "other",
            "fitness&gym": "other",
            education: "government",
            banking: "bank",
            governmentoffice: "government",
            entertainment: "other",
            professionalservices: "other",
            other: "other",
          };

          const mappedType = typeMapping[normalizedType] || "other";
          console.log(
            `Business type mapping: ${type} -> ${normalizedType} -> ${mappedType}`
          );

          // Create individual service object with business info
          return {
            id: business.id,
            type: mappedType,
            originalCategory: type,
            displayName: business.displayName, // Business name
            physicalAddress: business.physicalAddress,
            currentCount: business.currentCount,
            currentToken: business.currentToken,
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
        <p>Browse and book appointments with local businesses</p>
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

              {/* Current serving token (computed from appointments) */}
              <div
                className="service-token-info"
                style={{ marginBottom: "8px", fontWeight: "bold", color }}
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
