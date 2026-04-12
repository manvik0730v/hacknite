import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';
import locIcon from '../assets/loc.svg';

const locationIcon = new L.Icon({
  iconUrl: locIcon,
  iconSize: [25, 64],
  iconAnchor: [12, 32],  // dead center of the figure
  popupAnchor: [0, -32]
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 17);
  }, [position]);
  return null;
}

export default function MapPage() {
  const { sinMode } = useTheme();
  const [running, setRunning] = useState(false);
  const [route, setRoute] = useState([]);
  const [currentPos, setCurrentPos] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [stats, setStats] = useState({ distance: 0, duration: 0, calories: 0 });
  const [saved, setSaved] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const watchId = useRef(null);
  const startTime = useRef(null);
  const timerRef = useRef(null);

  const requestLocation = () => {
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      pos => setCurrentPos([pos.coords.latitude, pos.coords.longitude]),
      err => {
        setLocationError('Allow location permission in browser settings');
        setCurrentPos([12.9716, 77.5946]);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => { requestLocation(); }, []);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setStats(s => ({ ...s, duration: Math.floor((Date.now() - startTime.current) / 1000) }));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  const startRun = () => {
    setSaved(false);
    setLastRun(null);
    setRoute([]);
    setStats({ distance: 0, duration: 0, calories: 0 });
    startTime.current = Date.now();
    setRunning(true);
    watchId.current = navigator.geolocation.watchPosition(
      pos => {
        const point = [pos.coords.latitude, pos.coords.longitude];
        setCurrentPos(point);
        setRoute(prev => {
          const newRoute = [...prev, point];
          const dist = calculateDistance(newRoute);
          setStats(s => ({ ...s, distance: dist, calories: Math.floor(dist * 0.06) }));
          return newRoute;
        });
      },
      err => console.error(err),
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const stopRun = async () => {
    navigator.geolocation.clearWatch(watchId.current);
    setRunning(false);
    const finalDuration = Math.floor((Date.now() - startTime.current) / 1000);
    const finalDistance = calculateDistance(route);
    const finalCalories = Math.floor(finalDistance * 0.06);
    const pace = finalDistance > 0 ? (finalDuration / 60) / (finalDistance / 1000) : 0;

    const runData = {
      route: route.map(p => ({ lat: p[0], lng: p[1], timestamp: Date.now() })),
      duration: finalDuration,
      distance: finalDistance,
      calories: finalCalories,
      pace: parseFloat(pace.toFixed(2)),
      steps: Math.floor(finalDistance * 1.3),
      date: new Date()
    };

    setLastRun(runData);

    try {
      await API.post('/api/runs', runData);
      setSaved(true);
    } catch (err) {
      console.error('Failed to save run:', err);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="relative h-screen pb-16">
      {currentPos ? (
        <MapContainer center={currentPos} zoom={17}
          style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            url={sinMode
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
            attribution='&copy; OpenStreetMap'
          />
          {route.length > 1 && (
            <Polyline positions={route}
              color={sinMode ? '#00ffcc' : '#4f46e5'} weight={5} />
          )}
          <Marker position={currentPos} icon={locationIcon} />
          <RecenterMap position={running ? currentPos : null} />
        </MapContainer>
      ) : (
        <div className="h-full flex flex-col items-center justify-center gap-4">
          <p className="text-gray-500">Getting your location...</p>
          {locationError && (
            <div className="text-center mx-4">
              <p className="text-red-500 text-sm mb-3">{locationError}</p>
              <button onClick={requestLocation}
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Running stats bar */}
      {running && (
        <div className={`absolute top-4 left-4 right-4 z-[1000] rounded-2xl p-4 flex justify-around
          ${sinMode ? 'bg-black bg-opacity-90 text-cyan-400 border border-cyan-800' : 'bg-white bg-opacity-95 shadow-xl'}`}>
          <div className="text-center">
            <p className="text-xs text-gray-400">Time</p>
            <p className="text-xl font-bold tabular-nums">{formatTime(stats.duration)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Distance</p>
            <p className="text-xl font-bold">{(stats.distance / 1000).toFixed(2)} km</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Calories</p>
            <p className="text-xl font-bold">{stats.calories}</p>
          </div>
        </div>
      )}

      {/* Post-run summary card */}
      {lastRun && saved && (
        <div className={`absolute top-4 left-4 right-4 z-[1000] rounded-2xl p-5
          ${sinMode ? 'bg-black bg-opacity-95 border border-cyan-800 text-white' : 'bg-white shadow-2xl'}`}>
          <p className="text-center font-bold text-lg mb-4">
            {sinMode ? '⚡ Run Complete' : '🏃 Run Complete'}
          </p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-400">Time</p>
              <p className="text-lg font-bold tabular-nums">{formatTime(lastRun.duration)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Distance</p>
              <p className="text-lg font-bold">{(lastRun.distance / 1000).toFixed(2)} km</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Pace</p>
              <p className="text-lg font-bold">{lastRun.pace.toFixed(2)} min/km</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-xs text-gray-400">Calories</p>
              <p className="text-lg font-bold">{lastRun.calories} kcal</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Steps</p>
              <p className="text-lg font-bold">{lastRun.steps}</p>
            </div>
          </div>
          <p className="text-center text-green-500 font-bold mt-3 text-sm">✓ Saved to My Runs</p>
          <button onClick={() => setLastRun(null)}
            className="w-full mt-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold">
            Close
          </button>
        </div>
      )}

      {/* Play/Stop button */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[1000]">
        <button onClick={running ? stopRun : startRun}
          className={`w-20 h-20 rounded-full font-bold text-3xl shadow-2xl border-4 transition-all
            ${running
              ? 'bg-red-500 border-red-300 text-white scale-110 animate-pulse'
              : sinMode
                ? 'bg-cyan-400 border-cyan-200 text-black hover:scale-105'
                : 'bg-indigo-600 border-indigo-300 text-white hover:scale-105'}`}>
          {running ? '■' : '▶'}
        </button>
      </div>

      {/* Recenter button */}
      {!running && (
        <div className="absolute bottom-20 right-4 z-[1000]">
          <button onClick={requestLocation}
            className="w-12 h-12 rounded-full bg-white shadow-lg text-xl flex items-center justify-center border border-gray-200">
            📍
          </button>
        </div>
      )}
    </div>
  );
}

function calculateDistance(route) {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    const R = 6371e3;
    const φ1 = route[i-1][0] * Math.PI / 180;
    const φ2 = route[i][0] * Math.PI / 180;
    const Δφ = (route[i][0] - route[i-1][0]) * Math.PI / 180;
    const Δλ = (route[i][1] - route[i-1][1]) * Math.PI / 180;
    const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
    total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
  return Math.floor(total);
}
