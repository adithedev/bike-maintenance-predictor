import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bicycle icon with risk-based coloring
const createBikeIcon = (risk) => {
  const riskColor = risk > 70 ? "#ea4335" : risk > 40 ? "#fbbc04" : "#34a853";
  
  return L.divIcon({
    className: 'custom-bike-icon',
    html: `
      <div style="
        background-color: ${riskColor};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10.5l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1v-2c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.5-1.2-.8-1.9-.8-.7 0-1.4.3-1.9.8l-2.3 2.3c-.7.7-1 1.6-1 2.6v4.5h2v-4.5c0-.3.1-.5.3-.7zm7.2 2.5c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const MapView = ({ bikeLocations }) => {
  return (
    <MapContainer 
      center={[12.9716, 77.5946]} 
      zoom={13} 
      style={{ 
        height: "100%", 
        width: "100%", 
        borderRadius: "12px",
      }}
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {bikeLocations.map(bike => {
        const risk = bike.failure_probability * 100;
        return (
          <Marker 
            key={bike.bike_id} 
            position={[bike.latitude, bike.longitude]} 
            icon={createBikeIcon(risk)}
            eventHandlers={{
              mouseover: (e) => {
                e.target.openPopup();
                const markerElement = e.target.getElement();
                if (markerElement) {
                  markerElement.style.transform = 'scale(1.2)';
                  markerElement.style.zIndex = '1000';
                }
              },
              mouseout: (e) => {
                e.target.closePopup();
                const markerElement = e.target.getElement();
                if (markerElement) {
                  markerElement.style.transform = 'scale(1)';
                  markerElement.style.zIndex = '100';
                }
              }
            }}
          >
            <Popup>
              <div style={{ 
                minWidth: "180px", 
                padding: "12px",
                fontFamily: "'Roboto', sans-serif"
              }}>
                <h3 style={{ 
                  margin: "0 0 12px 0", 
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#202124",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <span style={{
                    background: "#1a73e8",
                    color: "white",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px"
                  }}>🚴</span>
                  Bike {bike.bike_id}
                </h3>
                
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  marginBottom: "12px",
                  padding: "8px",
                  borderRadius: "6px",
                  background: "#f8f9fa"
                }}>
                  <strong style={{ marginRight: "8px", color: "#5f6368" }}>Risk:</strong>
                  <span style={{ 
                    color: risk > 70 ? "#ea4335" : risk > 40 ? "#fbbc04" : "#34a853",
                    fontWeight: "600",
                    fontSize: "15px"
                  }}>
                    {risk.toFixed(1)}%
                  </span>
                </div>
                
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "8px",
                  fontSize: "14px",
                  color: "#5f6368"
                }}>
                  <div>
                    <strong>Lat:</strong> {bike.latitude.toFixed(4)}
                  </div>
                  <div>
                    <strong>Lng:</strong> {bike.longitude.toFixed(4)}
                  </div>
                </div>
                
                <div style={{
                  height: "8px",
                  width: "100%",
                  backgroundColor: "#f1f3f4",
                  borderRadius: "4px",
                  overflow: "hidden",
                  marginTop: "12px"
                }}>
                  <div 
                    style={{
                      height: "100%",
                      width: `${risk}%`,
                      backgroundColor: risk > 70 ? "#ea4335" : risk > 40 ? "#fbbc04" : "#34a853",
                      borderRadius: "4px",
                    }}
                  ></div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;