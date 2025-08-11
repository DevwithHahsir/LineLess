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
  onSnapshot,
} from "firebase/firestore";
import axios from "axios";
import { getAddressFromCoordinates } from "../../utils/geocoding";

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
  const [clientLocation, setClientLocation] = useState(null); // { lat, lng }
  // removed on-demand location button state

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
        } catch {
          // no console output per request
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
    } catch {
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
      if (API_KEY) {
        const response = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json?q=${lat},${lng}&key=${API_KEY}`
        );
        if (response.data?.results?.length > 0) {
          return response.data.results[0].formatted;
        }
      } else {
        // Fallback to OpenStreetMap Nominatim (no API key required)
        const res = await getAddressFromCoordinates(lat, lng);
        return res.formatted || res.fullAddress || "Address not available";
      }
      return "Address not found";
    } catch {
      // no console output per request
      return "Address not available";
    }
  };

  // Get client's location (from profile if available, otherwise try browser geolocation)
  useEffect(() => {
    const resolveClientLocation = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = await getDoc(doc(db, "userSignup", currentUser.uid));
          const data = userDoc.exists() ? userDoc.data() : null;
          const loc = data?.location;
          if (
            loc &&
            typeof loc.latitude !== "undefined" &&
            typeof loc.longitude !== "undefined"
          ) {
            const lat = Number(loc.latitude);
            const lng = Number(loc.longitude);
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
              setClientLocation({ lat, lng });
              return;
            }
          }
        }
      } catch {
        // ignore
      }

      // Fallback to browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setClientLocation({
              lat: Number(pos.coords.latitude),
              lng: Number(pos.coords.longitude),
            });
          },
          () => {
            // ignore if denied/unavailable
          },
          { enableHighAccuracy: true, maximumAge: 60000 }
        );
      }
    };

    resolveClientLocation();
  }, []);

  // Haversine distance in kilometers
  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // removed on-demand geolocation handler

  // Fetch business data
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true);

        // Fetch real data from Firebase - using the correct collection name
        const querySnapshot = await getDocs(
          collection(db, "businessRegistrations")
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

            let physicalAddress = null;

            // 1) Prefer explicit address fields on business
            if (
              typeof business.physicalAddress === "string" &&
              business.physicalAddress.trim()
            ) {
              physicalAddress = business.physicalAddress.trim();
            } else if (
              typeof business.address === "string" &&
              business.address.trim()
            ) {
              physicalAddress = business.address.trim();
            } else if (
              typeof business.location === "string" &&
              business.location.trim()
            ) {
              const locStr = business.location.trim();
              const parts = locStr.split(",").map((s) => Number(s.trim()));
              if (parts.length === 2 && parts.every(Number.isFinite)) {
                physicalAddress = await reverseGeocode(parts[0], parts[1]);
              } else {
                physicalAddress = locStr;
              }
            } else if (
              business.location &&
              typeof business.location === "object"
            ) {
              const locObj = business.location;
              const addr = (
                locObj.address ||
                locObj.formatted ||
                locObj.fullAddress ||
                ""
              )
                .toString()
                .trim();
              if (addr) {
                physicalAddress = addr;
              } else {
                const latCand = Number(locObj.lat ?? locObj.latitude);
                const lngCand = Number(locObj.lng ?? locObj.longitude);
                if (Number.isFinite(latCand) && Number.isFinite(lngCand)) {
                  physicalAddress = await reverseGeocode(latCand, lngCand);
                }
              }
            }

            // 2) If still missing, try explicit coordinates on business
            if (!physicalAddress && business.latitude && business.longitude) {
              physicalAddress = await reverseGeocode(
                business.latitude,
                business.longitude
              );
            }

            // 3) Final fallback: provider profile address/coords
            if (!physicalAddress && business.providerId) {
              try {
                const provDoc = await getDoc(
                  doc(db, "providerSignup", business.providerId)
                );
                const pdata = provDoc.exists() ? provDoc.data() : null;
                const ploc = pdata?.location;
                if (typeof ploc === "string" && ploc.trim()) {
                  const str = ploc.trim();
                  const coords = str.split(",").map((s) => Number(s.trim()));
                  if (coords.length === 2 && coords.every(Number.isFinite)) {
                    physicalAddress = await reverseGeocode(
                      coords[0],
                      coords[1]
                    );
                  } else {
                    physicalAddress = str;
                  }
                } else if (ploc && typeof ploc === "object") {
                  const pAddr = (
                    ploc.address ||
                    ploc.formatted ||
                    ploc.fullAddress ||
                    ""
                  )
                    .toString()
                    .trim();
                  if (pAddr) {
                    physicalAddress = pAddr;
                  } else {
                    const pLat = Number(ploc.lat ?? ploc.latitude);
                    const pLng = Number(ploc.lng ?? ploc.longitude);
                    if (Number.isFinite(pLat) && Number.isFinite(pLng)) {
                      physicalAddress = await reverseGeocode(pLat, pLng);
                    }
                  }
                }
              } catch {
                // ignore
              }
            }

            if (!physicalAddress) {
              physicalAddress = "Address not available";
            }

            // Fetch currentToken from business document, fallback to 0 if not present
            const currentToken =
              business.currentToken !== undefined ? business.currentToken : 0;

            // Compute distance from client to business if both locations are known
            let distanceKm = null;
            let bLat = Number(business.latitude);
            let bLng = Number(business.longitude);

            // Fallbacks: if coordinates are missing, try parsing from 'location'
            if (!Number.isFinite(bLat) || !Number.isFinite(bLng)) {
              const loc = business.location;
              if (loc && typeof loc === "object") {
                const candLat = Number(loc.lat ?? loc.latitude);
                const candLng = Number(loc.lng ?? loc.longitude);
                if (Number.isFinite(candLat) && Number.isFinite(candLng)) {
                  bLat = candLat;
                  bLng = candLng;
                }
              } else if (typeof loc === "string") {
                const parts = loc.split(",").map((s) => Number(s.trim()));
                if (parts.length === 2 && parts.every(Number.isFinite)) {
                  bLat = parts[0];
                  bLng = parts[1];
                }
              }
            }

            // Final fallback: try provider profile location
            if (
              (!Number.isFinite(bLat) || !Number.isFinite(bLng)) &&
              business.providerId
            ) {
              try {
                const provDoc = await getDoc(
                  doc(db, "providerSignup", business.providerId)
                );
                const pdata = provDoc.exists() ? provDoc.data() : null;
                const ploc = pdata?.location;
                const candLat = Number(ploc?.lat ?? ploc?.latitude);
                const candLng = Number(ploc?.lng ?? ploc?.longitude);
                if (Number.isFinite(candLat) && Number.isFinite(candLng)) {
                  bLat = candLat;
                  bLng = candLng;
                }
              } catch {
                // ignore provider location failures
              }
            }

            if (
              clientLocation &&
              Number.isFinite(bLat) &&
              Number.isFinite(bLng)
            ) {
              distanceKm = getDistanceKm(
                clientLocation.lat,
                clientLocation.lng,
                bLat,
                bLng
              );
            }

            return {
              ...business,
              displayName,
              physicalAddress,
              currentCount: business.count || 0, // Total booked tokens
              currentToken, // Current serving token
              distanceKm,
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
            // Spread category styling/info first
            ...getBusinessInfo(mappedType),
            // Then explicitly set the business-facing fields so they are not overwritten
            displayName: business.displayName, // Business name shown on card
            description:
              business.businessDescription ||
              getBusinessInfo(mappedType).description,
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
            // Add individual business details
            businesses: [business], // Keep the original structure for compatibility
            count: 1, // Individual business count
          };
        });

        setBusinessCategories(individualServices);
      } catch {
        // no console output per request
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [clientLocation]);

  // Live updates: reflect currentToken and count changes in real time
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "businessRegistrations"),
      (snap) => {
        if (!snap.empty) {
          const updates = new Map();
          snap.forEach((d) => {
            const data = d.data() || {};
            updates.set(d.id, {
              currentToken: data.currentToken ?? 0,
              currentCount: data.count ?? 0,
            });
          });
          setBusinessCategories((prev) =>
            prev.map((svc) =>
              updates.has(svc.id) ? { ...svc, ...updates.get(svc.id) } : svc
            )
          );
        }
      }
    );
    return () => unsub();
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
        {/* location button removed; auto-detect still active */}
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

              {/* {service.physicalAddress && (
                <div
                  className="service-business-location"
                  style={{ marginTop: "8px" }}
                >
                  <FaMapMarkerAlt className="service-location-icon" />
                  <span className="service-location-text">
                    {service.physicalAddress}
                  </span>
                </div>
              )} */}

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
