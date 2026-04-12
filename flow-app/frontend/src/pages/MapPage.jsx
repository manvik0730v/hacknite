import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import locImg from '../assets/loc.svg';

const locationIcon = new L.Icon({
  iconUrl: locImg,
  iconSize: [24, 60],
  iconAnchor: [12, 60],
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => { if (position) map.setView(position, 17); }, [position]);
  return null;
}

export default function MapPage() {
  const { sinMode } = useTheme();
  const location = useLocation();
  const nav = useNavigate();
  const quest = location.state?.quest || null;

  const [running, setRunning] = useState(false);
  const [route, setRoute] = useState([]);
  const [currentPos, setCurrentPos] = useState(null);
  const [stats, setStats] = useState({ distance: 0, duration: 0 });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [lastRunData, setLastRunData] = useState(null);
  const [questDone, setQuestDone] = useState(false);

  const watchId = useRef(null);
  const startTime = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setCurrentPos([pos.coords.latitude, pos.coords.longitude]),
      () => setCurrentPos([12.9716, 77.5946]),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        const dur = Math.floor((Date.now() - startTime.current) / 1000);
        setStats(s => ({ ...s, duration: dur }));
        // Check quest completion
        if (quest && !questDone) {
          if (quest.goalType === 'time' && dur >= quest.goalValue) setQuestDone(true);
          if (quest.goalType === 'distance' && stats.distance >= quest.goalValue) setQuestDone(true);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running, quest, questDone, stats.distance]);

  const startRun = () => {
    setRoute([]); setStats({ distance: 0, duration: 0 }); setQuestDone(false);
    startTime.current = Date.now();
    setRunning(true);
    watchId.current = navigator.geolocation.watchPosition(
      pos => {
        const point = [pos.coords.latitude, pos.coords.longitude];
        setCurrentPos(point);
        setRoute(prev => {
          const newRoute = [...prev, point];
          const dist = calcDist(newRoute);
          setStats(s => ({ ...s, distance: dist }));
          return newRoute;
        });
      },
      err => console.error(err),
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const stopRun = () => {
    navigator.geolocation.clearWatch(watchId.current);
    setRunning(false);
    const duration = Math.floor((Date.now() - startTime.current) / 1000);
    const distance = calcDist(route);
    const pace = distance > 0 ? parseFloat(((duration / 60) / (distance / 1000)).toFixed(2)) : 0;
    const steps = Math.floor(distance * 1.3);
    const calories = Math.floor(distance * 0.06);
    setLastRunData({ duration, distance, pace, steps, calories, route });
    setShowSaveModal(true);
  };

  const saveRun = async () => {
    try {
      await API.post('/api/runs', {
        ...lastRunData,
        route: lastRunData.route.map(p => ({ lat: p[0], lng: p[1], timestamp: Date.now() })),
        date: new Date()
      });
      if (quest && questDone) {
        await API.post('/api/quests/complete', { questId: quest.id });
      }
      setShowSaveModal(false);
      nav('/profile');
    } catch (err) {
      console.error(err);
    }
  };

  const discardRun = () => {
    setShowSaveModal(false);
    setLastRunData(null);
    setRoute([]);
  };

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div className="flex flex-col h-screen pb-16 bg-[var(--bg)]">
      {/* Quest banner */}
      {quest && (
        <div className={`px-4 py-2.5 flex items-center gap-2 text-sm font-bold
          ${sinMode ? 'bg-red-950 text-red-300' : 'bg-[#111] text-white'}`}>
          <span>{quest.emoji}</span>
          <span>{quest.title}</span>
          <span className="ml-auto opacity-70">
            {quest.goalType === 'time'
              ? `${fmt(stats.duration)} / ${fmt(quest.goalValue)}`
              : `${(stats.distance/1000).toFixed(2)}km / ${(quest.goalValue/1000).toFixed(1)}km`}
          </span>
          {questDone && <span className="text-green-400">✓</span>}
        </div>
      )}

      {/* Map — top half */}
      <div className="flex-1" style={{ maxHeight: '55vh' }}>
        {currentPos ? (
          <MapContainer center={currentPos} zoom={17} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
              url={sinMode
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
              attribution='&copy; OpenStreetMap'
            />
            {route.length > 1 && (
              <Polyline positions={route} color={sinMode ? '#cc0000' : '#111'} weight={5} />
            )}
            <Marker position={currentPos} icon={locationIcon} />
            <RecenterMap position={running ? currentPos : null} />
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-[var(--bg3)]">
            <p className="text-[var(--text2)]">Getting location...</p>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 bg-[var(--bg)]">
        {/* Live stats */}
        <div className="w-full grid grid-cols-2 gap-3">
          {[
            { label: 'Time', value: fmt(stats.duration) },
            { label: 'Distance', value: `${(stats.distance/1000).toFixed(2)} km` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)] text-center">
              <p className="text-xs text-[var(--text2)]">{label}</p>
              <p className="text-2xl font-black text-[var(--text)] tabular-nums">{value}</p>
            </div>
          ))}
        </div>

        {/* Start/Stop */}
        <button onClick={running ? stopRun : startRun}
          className={`w-20 h-20 rounded-full text-3xl font-black shadow-xl border-4 transition-all active:scale-95
            ${running
              ? 'bg-red-500 border-red-300 text-white animate-pulse'
              : sinMode
                ? 'bg-red-600 border-red-400 text-white'
                : 'bg-[#111] border-[#333] text-white'}`}>
          {running ? '■' : '▶'}
        </button>
        <p className="text-xs text-[var(--text2)]">{running ? 'Tap to stop' : 'Tap to start'}</p>
      </div>

      {/* Save modal */}
      {showSaveModal && lastRunData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end z-50">
          <div className={`w-full rounded-t-3xl p-6 ${sinMode ? 'bg-[#140000]' : 'bg-white'}`}>
            <h2 className="text-xl font-black text-[var(--text)] mb-4 text-center">Save this run?</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Time',     value: fmt(lastRunData.duration) },
                { label: 'Distance', value: `${(lastRunData.distance/1000).toFixed(2)} km` },
                { label: 'Avg Pace', value: `${lastRunData.pace} min/km` },
                { label: 'Steps',    value: lastRunData.steps },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-3 bg-[var(--bg3)] text-center">
                  <p className="text-xs text-[var(--text2)]">{label}</p>
                  <p className="font-black text-lg text-[var(--text)]">{value}</p>
                </div>
              ))}
            </div>
            {quest && questDone && (
              <div className={`rounded-xl p-3 mb-4 text-center text-sm font-bold
                ${sinMode ? 'bg-red-950 text-red-300' : 'bg-green-50 text-green-700'}`}>
                🎉 Quest "{quest.title}" completed! +{quest.xp.toLocaleString()} XP
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={discardRun}
                className="flex-1 py-3.5 rounded-2xl border border-[var(--border)] text-[var(--text)] font-bold">
                Discard
              </button>
              <button onClick={saveRun}
                className={`flex-1 py-3.5 rounded-2xl font-bold text-white
                  ${sinMode ? 'bg-red-600' : 'bg-[#111]'}`}>
                Save Run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function calcDist(route) {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    const R = 6371e3;
    const φ1 = route[i-1][0] * Math.PI/180, φ2 = route[i][0] * Math.PI/180;
    const Δφ = (route[i][0]-route[i-1][0]) * Math.PI/180;
    const Δλ = (route[i][1]-route[i-1][1]) * Math.PI/180;
    const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
    total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
  return Math.floor(total);
}
