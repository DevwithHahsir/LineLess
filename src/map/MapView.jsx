// src/components/MapView.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Use default Leaflet marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MapView = ({ lat, lng, businesses = [] }) => {
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

  // Remove business type color/icon logic

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

    return isValid;
  });

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

        {/* User location marker - default icon */}
        <Marker position={position}>
          <Popup>
            <div>
              <strong>Your Location</strong>
              <br />
              Lat: {parseFloat(lat).toFixed(6)}
              <br />
              Lng: {parseFloat(lng).toFixed(6)}
            </div>
          </Popup>
        </Marker>

        {/* Business location markers with default icon */}
        {validBusinesses.map((business, index) => {
          const businessLat = parseFloat(business.latitude);
          const businessLng = parseFloat(business.longitude);
          return (
            <Marker
              key={business.id || `business-${index}`}
              position={[businessLat, businessLng]}
            >
              <Popup>
                <div style={{ minWidth: "200px" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#333" }}>
                    {business.businessName || business.name || "Business"}
                  </h4>
                  {business.physicalAddress && (
                    <p style={{ margin: "4px 0", fontSize: "13px" }}>
                      <strong>Address:</strong> {business.physicalAddress}
                    </p>
                  )}
                  {business.phone && (
                    <p style={{ margin: "4px 0", fontSize: "14px" }}>
                      <strong>Phone:</strong> {business.phone}
                    </p>
                  )}
                  {business.openTime && business.closeTime && (
                    <p style={{ margin: "4px 0", fontSize: "14px" }}>
                      <strong>Hours:</strong> {business.openTime} -{" "}
                      {business.closeTime}
                    </p>
                  )}
                  <p style={{ margin: "4px 0", fontSize: "14px" }}>
                    <strong>Queue:</strong> {business.currentCount || 0} people
                    waiting
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

      {/* Map Legend removed */}

      {/* Debug info */}
      <div style={{ marginTop: "8px", fontSize: "11px", color: "#999" }}>
        Total: {businesses.length} | Valid: {validBusinesses.length} | Location:{" "}
        {lat}, {lng}
      </div>
    </div>
  );
};

export default MapView;
