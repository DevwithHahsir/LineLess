// src/components/MapView.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
});

const createIcon = (color = "blue") => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const MapView = ({ lat, lng, businesses = [] }) => {
  console.log("=== MapView Debug Info ===");
  console.log("User location:", { lat, lng });
  console.log("Businesses array:", businesses);
  console.log("Number of businesses:", businesses.length);

  // Log each business in detail
  businesses.forEach((business, index) => {
    console.log(`Business ${index}:`, {
      id: business.id,
      name: business.businessName || business.name,
      type: business.type,
      latitude: business.latitude,
      longitude: business.longitude,
      latType: typeof business.latitude,
      lngType: typeof business.longitude,
      parsedLat: parseFloat(business.latitude),
      parsedLng: parseFloat(business.longitude),
      isValidLat: !isNaN(parseFloat(business.latitude)),
      isValidLng: !isNaN(parseFloat(business.longitude)),
    });
  });

  if (!lat || !lng) {
    return (
      <div
        style={{
          height: "400px",
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
          color: "#6c757d",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p>
            <strong>No location data available</strong>
          </p>
          <p>Please provide valid latitude and longitude coordinates</p>
        </div>
      </div>
    );
  }

  const position = [parseFloat(lat), parseFloat(lng)];

  // Get business type icon (matching ListServices for consistency)
  const getBusinessTypeInfo = (type) => {
    const typeInfo = {
      bank: { color: "blue", name: "Banks & Finance", icon: "🏦" },
      salon: { color: "violet", name: "Salons & Beauty", icon: "💇" },
      clinic: { color: "red", name: "Healthcare & Clinics", icon: "🏥" },
      government: { color: "orange", name: "Government Offices", icon: "🏛️" },
      other: { color: "green", name: "Other Services", icon: "🏪" },
    };
    return (
      typeInfo[type] || { color: "grey", name: "Unknown Service", icon: "📍" }
    );
  };

  // Filter businesses with valid coordinates
  const validBusinesses = businesses.filter((business) => {
    const hasLat =
      business.latitude !== undefined &&
      business.latitude !== null &&
      business.latitude !== "";
    const hasLng =
      business.longitude !== undefined &&
      business.longitude !== null &&
      business.longitude !== "";
    const validLat = !isNaN(parseFloat(business.latitude));
    const validLng = !isNaN(parseFloat(business.longitude));

    const isValid = hasLat && hasLng && validLat && validLng;

    if (!isValid) {
      console.log(`Invalid business filtered out:`, {
        id: business.id,
        name: business.businessName,
        latitude: business.latitude,
        longitude: business.longitude,
        hasLat,
        hasLng,
        validLat,
        validLng,
      });
    }

    return isValid;
  });

  console.log(
    `Valid businesses for map: ${validBusinesses.length} out of ${businesses.length}`
  );

  return (
    <div
      style={{
        height: "400px",
        width: "100%",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <MapContainer
        center={position}
        zoom={12}
        style={{ height: "100%", width: "100%", borderRadius: "8px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker - Red color */}
        <Marker position={position} icon={createIcon("red")}>
          <Popup>
            <div>
              <strong>📍 Your Location</strong>
              <br />
              Lat: {parseFloat(lat).toFixed(6)}
              <br />
              Lng: {parseFloat(lng).toFixed(6)}
            </div>
          </Popup>
        </Marker>

        {/* Business location markers with color-coded icons */}
        {validBusinesses.map((business, index) => {
          const businessLat = parseFloat(business.latitude);
          const businessLng = parseFloat(business.longitude);
          const typeInfo = getBusinessTypeInfo(business.type);

          console.log(`Rendering marker for business ${index}:`, {
            name: business.businessName,
            type: business.type,
            position: [businessLat, businessLng],
            color: typeInfo.color,
          });

          return (
            <Marker
              key={business.id || `business-${index}`}
              position={[businessLat, businessLng]}
              icon={createIcon(typeInfo.color)}
            >
              <Popup>
                <div style={{ minWidth: "200px" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#333" }}>
                    {typeInfo.icon}{" "}
                    {business.businessName || business.name || "Business"}
                  </h4>
                  <p
                    style={{
                      margin: "4px 0",
                      fontSize: "14px",
                      fontWeight: "600",
                      color:
                        typeInfo.color === "blue"
                          ? "#1976d2"
                          : typeInfo.color === "red"
                          ? "#d32f2f"
                          : typeInfo.color === "orange"
                          ? "#f57c00"
                          : typeInfo.color === "violet"
                          ? "#7b1fa2"
                          : "#388e3c",
                    }}
                  >
                    <strong>Category:</strong> {typeInfo.name}
                  </p>
                  {business.physicalAddress && (
                    <p style={{ margin: "4px 0", fontSize: "13px" }}>
                      <strong>📍 Address:</strong> {business.physicalAddress}
                    </p>
                  )}
                  {business.phone && (
                    <p style={{ margin: "4px 0", fontSize: "14px" }}>
                      <strong>📞 Phone:</strong> {business.phone}
                    </p>
                  )}
                  {business.openTime && business.closeTime && (
                    <p style={{ margin: "4px 0", fontSize: "14px" }}>
                      <strong>🕒 Hours:</strong> {business.openTime} -{" "}
                      {business.closeTime}
                    </p>
                  )}
                  <p style={{ margin: "4px 0", fontSize: "14px" }}>
                    <strong>👥 Queue:</strong> {business.currentCount || 0}{" "}
                    people waiting
                  </p>
                  <p
                    style={{ margin: "4px 0", fontSize: "12px", color: "#666" }}
                  >
                    Coordinates: {businessLat.toFixed(6)},{" "}
                    {businessLng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
        <div style={{ marginBottom: "8px", fontWeight: "600" }}>
          Map Legend:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#d32f2f",
                borderRadius: "50%",
              }}
            ></div>
            <span>Your Location</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#1976d2",
                borderRadius: "50%",
              }}
            ></div>
            <span>Banks & Finance</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#7b1fa2",
                borderRadius: "50%",
              }}
            ></div>
            <span>Salons & Beauty</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#d32f2f",
                borderRadius: "50%",
              }}
            ></div>
            <span>Healthcare & Clinics</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#f57c00",
                borderRadius: "50%",
              }}
            ></div>
            <span>Government Offices</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#388e3c",
                borderRadius: "50%",
              }}
            ></div>
            <span>Other Services</span>
          </div>
        </div>
      </div>

      {/* Debug info */}
      <div style={{ marginTop: "8px", fontSize: "11px", color: "#999" }}>
        Total: {businesses.length} | Valid: {validBusinesses.length} | Location:{" "}
        {lat}, {lng}
      </div>
    </div>
  );
};

export default MapView;
