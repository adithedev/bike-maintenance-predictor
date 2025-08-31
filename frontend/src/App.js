import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bike icon with glowing effect
const createBikeIcon = (risk, isSelected) => {
  const riskColor = risk > 70 ? "#d32f2f" : risk > 40 ? "#f57c00" : "#2e7d32";
  const scale = isSelected ? 1.3 : 1;

  return L.divIcon({
    className: 'custom-bike-icon',
    html: `
      <div class="bike-marker" style="
        background: linear-gradient(135deg, ${riskColor}, ${riskColor}cc);
        width: ${46 * scale}px;
        height: ${46 * scale}px;
        border-radius: 50%;
        border: 3px solid var(--icon-border);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 20px ${riskColor}80;
        animation: ${isSelected ? 'pulse 1.8s infinite' : 'none'};
        transition: all 0.3s ease;
      ">
        <svg width="${22 * scale}" height="${22 * scale}" viewBox="0 0 24 24" fill="var(--icon-fill)">
          <path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10.5l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1v-2c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.5-1.2-.8-1.9-.8-.7 0-1.4.3-1.9.8l-2.3 2.3c-.7.7-1 1.6-1 2.6v4.5h2v-4.5c0-.3.1-.5.3-.7zm7.2 2.5c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/>
        </svg>
      </div>
    `,
    iconSize: [46 * scale, 46 * scale],
    iconAnchor: [23 * scale, 23 * scale],
  });
};

const MapView = ({ bikeLocations, selectedBike, onMarkerClick, sidebarOpen, theme }) => {
  const mapRef = useRef();

  useEffect(() => {
    if (selectedBike && mapRef.current) {
      const map = mapRef.current;
      map.flyTo([selectedBike.latitude, selectedBike.longitude], 16, {
        duration: 1.2,
        easeLinearity: 0.3
      });
    }
  }, [selectedBike]);

  return (
    <MapContainer 
      center={[12.9716, 77.5946]} 
      zoom={12} 
      style={{ 
        height: "100vh", 
        width: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1,
        background: "var(--map-bg)"
      }}
      zoomControl={false}
      attributionControl={false}
      ref={mapRef}
    >
      <TileLayer
        url={theme === "light" 
          ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <ZoomControl position="bottomright" />
      {bikeLocations.map(bike => {
        const risk = bike.failure_probability * 100;
        const isSelected = selectedBike && selectedBike.bike_id === bike.bike_id;
        return (
          <Marker 
            key={bike.bike_id} 
            position={[bike.latitude, bike.longitude]} 
            icon={createBikeIcon(risk, isSelected)}
            eventHandlers={{
              click: () => onMarkerClick(bike)
            }}
          >
            <Popup autoClose={false} closeOnClick={false}>
              <div style={{ 
                minWidth: "240px", 
                padding: "20px",
                background: "var(--card-bg)",
                color: "var(--text-primary)",
                borderRadius: "16px",
                boxShadow: "0 6px 24px rgba(0,0,0,0.3)",
                border: `2px solid ${isSelected ? "var(--primary)" : "var(--border)"}`
              }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--border)"
                }}>
                  <div style={{
                    background: risk > 70 ? "#d32f2f" : risk > 40 ? "#f57c00" : "#2e7d32",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                    boxShadow: `0 0 15px ${risk > 70 ? "#d32f2f" : risk > 40 ? "#f57c00" : "#2e7d32"}80`
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--icon-fill)">
                      <path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10.5l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1v-2c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.5-1.2-.8-1.9-.8-.7 0-1.4.3-1.9.8l-2.3 2.3c-.7.7-1 1.6-1 2.6v4.5h2v-4.5c0-.3.1-.5.3-.7zm7.2 2.5c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/>
                    </svg>
                  </div>
                  <div>
                    <strong style={{ fontSize: "18px", display: "block" }}>Bike {bike.bike_id}</strong>
                    <span style={{ 
                      color: risk > 70 ? "#d32f2f" : risk > 40 ? "#f57c00" : "#2e7d32",
                      fontSize: "15px",
                      fontWeight: "600"
                    }}>{risk.toFixed(1)}% Risk</span>
                  </div>
                </div>
                <div style={{ lineHeight: "1.6", fontSize: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Location:</span>
                    <span>{bike.latitude.toFixed(4)}, {bike.longitude.toFixed(4)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Last Maintenance:</span>
                    <span>14 days ago</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Status:</span>
                    <span style={{ 
                      color: risk > 70 ? "#d32f2f" : risk > 40 ? "#f57c00" : "#2e7d32",
                      fontWeight: "600"
                    }}>
                      {risk > 70 ? "Critical" : risk > 40 ? "Warning" : "Normal"}
                    </span>
                  </div>
                  <button 
                    style={{
                      marginTop: "16px",
                      background: "linear-gradient(90deg, var(--primary), var(--primary-hover))",
                      color: "var(--button-text)",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      width: "100%",
                      transition: "all 0.3s ease"
                    }}
                    onClick={() => alert(`Scheduling maintenance for Bike ${bike.bike_id}`)}
                    onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
                    onMouseLeave={e => e.target.style.transform = "translateY(0)"}
                  >
                    Schedule Maintenance
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

const LoadingSpinner = () => (
  <div style={{ 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center", 
    justifyContent: "center", 
    height: "100vh",
    background: "var(--bg-primary)",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000
  }}>
    <div style={{
      width: "72px",
      height: "72px",
      border: "6px solid var(--spinner-border)",
      borderTop: "6px solid var(--primary)",
      borderRadius: "50%",
      animation: "spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite",
      marginBottom: "28px",
      boxShadow: "0 6px 20px rgba(26,115,232,0.5)"
    }}></div>
    <h2 style={{ 
      color: "var(--text-primary)", 
      fontSize: "24px",
      fontWeight: "600",
      margin: "0 0 8px 0",
      background: "linear-gradient(90deg, var(--text-primary), var(--primary))",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent"
    }}>Loading Bike Insights...</h2>
    <p style={{
      color: "var(--text-secondary)",
      margin: 0,
      fontSize: "16px"
    }}>Initializing predictive analytics...</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Dashboard Stats Component (from friend's code)
const DashboardStats = ({ bikes }) => {
  const totalBikes = bikes.length;
  const criticalBikes = bikes.filter(bike => bike.failure_probability * 100 > 70).length;
  const warningBikes = bikes.filter(bike => {
    const risk = bike.failure_probability * 100;
    return risk > 40 && risk <= 70;
  }).length;
  const normalBikes = bikes.filter(bike => bike.failure_probability * 100 <= 40).length;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
      gap: "16px",
      marginBottom: "28px"
    }}>
      {[
        { label: "Total Bikes", value: totalBikes, color: "var(--primary)", width: "100%" },
        { label: "Normal", value: normalBikes, color: "#2e7d32", width: `${(normalBikes / totalBikes) * 100}%` },
        { label: "Warning", value: warningBikes, color: "#f57c00", width: `${(warningBikes / totalBikes) * 100}%` },
        { label: "Critical", value: criticalBikes, color: "#d32f2f", width: `${(criticalBikes / totalBikes) * 100}%` }
      ].map((stat, index) => (
        <div key={index} style={{
          background: "var(--card-bg)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
          border: "1px solid var(--border)",
          transition: "all 0.3s ease",
          cursor: "pointer"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = `0 8px 24px ${stat.color}40`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
        }}>
          <span style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "8px", display: "block" }}>{stat.label}</span>
          <span style={{ color: stat.color, fontSize: "28px", fontWeight: "700" }}>{stat.value}</span>
          <div style={{ 
            height: "5px", 
            background: "var(--border)", 
            borderRadius: "3px", 
            marginTop: "12px",
            overflow: "hidden"
          }}>
            <div style={{ 
              height: "100%", 
              width: stat.width, 
              background: `linear-gradient(90deg, ${stat.color}, ${stat.color}cc)`,
              borderRadius: "3px",
              transition: "width 0.5s ease"
            }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

function App() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("risk");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState("light");
  const [selectedBike, setSelectedBike] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const refreshIntervalRef = useRef(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    axios.get("http://localhost:8000/predictions")
      .then(res => setBikes(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
    if (isRefreshing) {
      refreshIntervalRef.current = setInterval(fetchData, 30000);
    }
    return () => clearInterval(refreshIntervalRef.current);
  }, [fetchData, isRefreshing]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  }, []);

  const toggleRefresh = useCallback(() => {
    setIsRefreshing(prev => !prev);
  }, []);

  const handleMarkerClick = useCallback((bike) => {
    setSelectedBike(bike);
    setSidebarOpen(true);
  }, []);

  const filteredAndSortedBikes = useMemo(() => {
    return bikes
      .filter(bike => 
        bike.bike_id.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === "risk") {
          return b.failure_probability - a.failure_probability;
        }
        return a.bike_id - b.bike_id;
      });
  }, [bikes, searchTerm, sortBy]);

  const highRiskCount = useMemo(() => {
    return bikes.filter(bike => bike.failure_probability * 100 > 70).length;
  }, [bikes]);

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100vh",
      background: "var(--bg-primary)",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000
    }}>
      <div style={{ 
        textAlign: "center", 
        padding: "48px",
        background: "var(--card-bg)",
        borderRadius: "20px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
        border: "1px solid var(--border)",
        maxWidth: "500px",
        animation: "fadeIn 0.5s ease-out"
      }}>
        <div style={{ 
          fontSize: "64px", 
          marginBottom: "24px",
          color: "var(--error)",
          filter: "drop-shadow(0 0 20px rgba(211,47,47,0.5))"
        }}>⚠️</div>
        <h2 style={{ 
          color: "var(--text-primary)", 
          marginBottom: "16px",
          fontWeight: "600",
          fontSize: "26px"
        }}>Connection Failed</h2>
        <p style={{ 
          color: "var(--text-secondary)",
          margin: "0 0 28px 0",
          fontSize: "16px",
          lineHeight: "1.5"
        }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: "linear-gradient(90deg, var(--primary), var(--primary-hover))",
            color: "var(--button-text)",
            border: "none",
            padding: "14px 32px",
            borderRadius: "10px",
            fontWeight: "500",
            fontSize: "16px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 16px rgba(26,115,232,0.4)"
          }}
          onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.target.style.transform = "translateY(0)"}
        >
          Retry Connection
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      fontFamily: "'Google Sans', 'Roboto', sans-serif",
      height: "100vh",
      overflow: "hidden",
      background: "var(--bg-primary)",
      color: "var(--text-primary)",
      transition: "all 0.4s ease"
    }} className={theme}>
      <style>{`
        :root {
          --primary: #1a73e8;
          --primary-hover: #1557b0;
          --error: #d32f2f;
          --success: #2e7d32;
          --warning: #f57c00;
        }
        .light {
          --bg-primary: #f8f9fa;
          --card-bg: #ffffff;
          --popup-bg: #ffffff;
          --map-bg: #e8eaed;
          --text-primary: #202124;
          --text-secondary: #5f6368;
          --border: #dadce0;
          --icon-border: #ffffff;
          --icon-fill: #ffffff;
          --button-text: #ffffff;
          --spinner-border: #e8eaed;
          --sidebar-bg: rgba(255, 255, 255, 0.95);
        }
        .dark {
          --bg-primary: #202124;
          --card-bg: #303134;
          --popup-bg: #303134;
          --map-bg: #171717;
          --text-primary: #e8eaed;
          --text-secondary: #9aa0a6;
          --border: #5f6368;
          --icon-border: #303134;
          --icon-fill: #e8eaed;
          --button-text: #e8eaed;
          --spinner-border: #3c4043;
          --sidebar-bg: rgba(32, 33, 36, 0.96);
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Google Sans', 'Roboto', sans-serif;
          letter-spacing: 0.2px;
        }
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
          50% { transform: scale(1.08); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
          100% { transform: scale(1); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { right: -400px; }
          to { right: 0; }
        }
        @media (max-width: 768px) {
          .sidebar {
            width: 100% !important;
            padding: 80px 16px 16px 16px !important;
          }
          .dashboard-stats {
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)) !important;
          }
        }
      `}</style>

      <MapView 
        bikeLocations={bikes} 
        selectedBike={selectedBike}
        onMarkerClick={handleMarkerClick}
        sidebarOpen={sidebarOpen}
        theme={theme}
      />
      
      {/* Floating header */}
      <header style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 100,
        background: "var(--card-bg)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        padding: "16px 24px",
        boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        animation: "fadeIn 0.5s ease-out"
      }}>
        <div style={{
          background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
          color: "var(--button-text)",
          width: "52px",
          height: "52px",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "26px",
          boxShadow: "0 6px 20px rgba(26,115,232,0.4)"
        }}>🚴</div>
        <div>
          <h1 style={{ 
            fontSize: "22px", 
            fontWeight: "500", 
            color: "var(--text-primary)",
            margin: 0,
            letterSpacing: "-0.2px"
          }}>
            Bike Maintenance Hub
          </h1>
          <p style={{
            color: "var(--text-secondary)",
            margin: 0,
            fontSize: "14px",
            lineHeight: "1.5"
          }}>
            {bikes.length} bikes • <span style={{ color: highRiskCount > 0 ? "var(--error)" : "var(--success)" }}>
              {highRiskCount} critical
            </span>
          </p>
        </div>
      </header>

      {/* Control buttons */}
      <div style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 100,
        display: "flex",
        gap: "12px"
      }}>
        <button 
          onClick={toggleRefresh}
          style={{
            background: isRefreshing ? "var(--success)" : "var(--card-bg)",
            color: isRefreshing ? "var(--button-text)" : "var(--text-primary)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            cursor: "pointer",
            fontSize: "20px",
            transition: "all 0.3s ease"
          }}
          aria-label={isRefreshing ? "Pause auto-refresh" : "Enable auto-refresh"}
          title={isRefreshing ? "Pause auto-refresh" : "Enable auto-refresh"}
          onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.target.style.transform = "translateY(0)"}
        >
          {isRefreshing ? "⏸️" : "🔄"}
        </button>
        <button 
          onClick={toggleTheme}
          style={{
            background: "var(--card-bg)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            cursor: "pointer",
            fontSize: "20px",
            transition: "all 0.3s ease"
          }}
          aria-label="Toggle theme"
          title="Toggle theme"
          onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.target.style.transform = "translateY(0)"}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: "var(--card-bg)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            cursor: "pointer",
            fontSize: "22px",
            transition: "all 0.3s ease"
          }}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
          onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.target.style.transform = "translateY(0)"}
        >
          {sidebarOpen ? "✕" : "≡"}
        </button>
      </div>

      {/* Sidebar with DashboardStats */}
      <div className="sidebar" style={{ 
        position: "fixed",
        top: 0,
        right: sidebarOpen ? 0 : "-420px",
        height: "100vh",
        width: "420px",
        zIndex: 50,
        background: "var(--sidebar-bg)",
        backdropFilter: "blur(20px)",
        boxShadow: "-6px 0 24px rgba(0,0,0,0.3)",
        borderLeft: "1px solid var(--border)",
        padding: "80px 24px 24px 24px",
        overflowY: "auto",
        transition: "right 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: sidebarOpen ? "slideInRight 0.4s ease-out" : "none"
      }}>
        <DashboardStats bikes={bikes} />

        <div style={{
          marginBottom: "28px"
        }}>
          <h2 style={{ 
            margin: "0 0 20px 0", 
            fontSize: "22px",
            fontWeight: "500",
            color: "var(--text-primary)",
            letterSpacing: "-0.2px"
          }}>Maintenance Priority</h2>
          
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="text"
                placeholder="Search Bike ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 44px",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  fontSize: "15px",
                  outline: "none",
                  background: "var(--card-bg)",
                  color: "var(--text-primary)",
                  transition: "all 0.3s ease",
                  boxShadow: "inset 0 1px 4px rgba(0,0,0,0.1)"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.boxShadow = "0 0 0 4px rgba(26,115,232,0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "inset 0 1px 4px rgba(0,0,0,0.1)";
                }}
              />
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="var(--text-secondary)" 
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)"
                }}
              >
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "14px 40px 14px 14px",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                fontSize: "15px",
                background: "var(--card-bg)",
                color: "var(--text-primary)",
                outline: "none",
                minWidth: "130px",
                cursor: "pointer",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='var(--text-secondary)'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 14px center",
                backgroundSize: "20px",
                transition: "all 0.3s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--primary)";
                e.target.style.boxShadow = "0 0 0 4px rgba(26,115,232,0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="risk">By Risk</option>
              <option value="id">By ID</option>
            </select>
          </div>
        </div>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          {filteredAndSortedBikes.map(bike => {
            const risk = bike.failure_probability * 100;
            const riskColor = risk > 70 ? "#d32f2f" : risk > 40 ? "#f57c00" : "#2e7d32";
            const isSelected = selectedBike && selectedBike.bike_id === bike.bike_id;

            return (
              <div 
                key={bike.bike_id} 
                style={{ 
                  padding: "20px",
                  borderRadius: "16px",
                  backgroundColor: isSelected ? "rgba(26,115,232,0.15)" : "var(--card-bg)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                  border: `1px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  animation: isSelected ? "pulse 1.8s infinite" : "none"
                }}
                onClick={() => setSelectedBike(bike)}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 8px 24px ${riskColor}40`;
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
                  }
                }}
              >
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: "16px"
                }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: riskColor,
                      marginRight: "12px",
                      boxShadow: `0 0 12px ${riskColor}80`
                    }}></div>
                    <strong style={{ 
                      fontSize: "18px", 
                      color: "var(--text-primary)" 
                    }}>Bike {bike.bike_id}</strong>
                  </div>
                  <span style={{ 
                    color: riskColor, 
                    fontWeight: "600",
                    fontSize: "16px",
                    background: "rgba(0,0,0,0.2)",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: `1px solid ${riskColor}40`
                  }}>{risk.toFixed(1)}% Risk</span>
                </div>
                
                <div style={{
                  height: "8px",
                  width: "100%",
                  background: "var(--border)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  marginBottom: "10px"
                }}>
                  <div 
                    style={{
                      height: "100%",
                      width: `${risk}%`,
                      background: `linear-gradient(90deg, ${riskColor}, ${riskColor}cc)`,
                      borderRadius: "4px",
                      transition: "width 0.5s ease",
                      boxShadow: `0 0 10px ${riskColor}80`
                    }}
                  ></div>
                </div>
                
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  fontWeight: "400"
                }}>
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;