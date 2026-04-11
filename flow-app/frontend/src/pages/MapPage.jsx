import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function MapPage() {
  const { dbUser } = useAuth();
  const { sinMode } = useTheme();
  const [running, setRunning] = useState(false);
  const [route, setRoute] = useState([]);
  const [regions, setRegions] = useState([]);
  const watchId = useRef(null);
  const startTime = useRef(null);

  const startRun = () => {
    setRunning(true);
    startTime.current = Date.now();
    watchId.current = navigator.geolocation.watchPosition((pos) => {
      const point = { lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: Date.now() };
      setRoute(prev => [...prev, point]);
    }, null, { enableHighAccuracy: true });
  };

  const stopRun = async () => {
    navigator.geolocation.clearWatch(watchId.current);
    setRunning(false);
    const duration = Math.floor((Date.now() - startTime.current) / 1000);
    // Calculate distance from route
    const distance = calculateDistance(route);
    const calories = Math.floor(distance * 0.06);
    await API.post('/api/runs', { route, duration, distance, calories });
    setRoute([]);
  };

  // Load SIN mode regions
  useEffect(() => {
    if (sinMode) {
      API.get('/api/regions').then(res => setRegions(res.data));
    }
  }, [sinMode]);

  return (
    <div className="h-screen relative pb-20">
      <MapContainer
        center={[12.9716, 77.5946]} // Bangalore default
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url={sinMode
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />
        {route.length > 1 && (
          <Polyline positions={route.map(p => [p.lat, p.lng])} color={sinMode ? '#00ffcc' : '#4f46e5'} />
        )}
        {/* SIN mode glowing regions */}
        {sinMode && regions.map(r => (
          <Circle key={r._id} center={[r.center.lat, r.center.lng]}
            radius={r.radius} color={r.glowColor} fillOpacity={0.2} />
        ))}
      </MapContainer>

      {/* Play/Pause button */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000]">
        <button
          onClick={running ? stopRun : startRun}
          className={`w-16 h-16 rounded-full font-bold text-2xl shadow-xl ${
            running ? 'bg-red-500 text-white' : 'bg-cyan-400 text-black'}`}>
          {running ? '■' : '▶'}
        </button>
      </div>
    </div>
  );
}

function calculateDistance(route) {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    const R = 6371e3;
    const φ1 = route[i-1].lat * Math.PI/180;
    const φ2 = route[i].lat * Math.PI/180;
    const Δφ = (route[i].lat - route[i-1].lat) * Math.PI/180;
    const Δλ = (route[i].lng - route[i-1].lng) * Math.PI/180;
    const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
    total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
  return Math.floor(total);
}