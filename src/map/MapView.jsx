// src/components/MapView.jsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers not showing
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const MapView = ({ lat, lng }) => {
  // Validate that coordinates are provided
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
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

  const position = [lat, lng];

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
        zoom={13}
        style={{ height: "100%", width: "100%", borderRadius: "8px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div>
              <strong>User Location</strong>
              <br />
              Latitude: {parseFloat(lat).toFixed(6)}
              <br />
              Longitude: {parseFloat(lng).toFixed(6)}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapView;
