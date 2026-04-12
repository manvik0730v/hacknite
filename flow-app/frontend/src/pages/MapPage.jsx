import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiPlay, FiSquare, FiSearch, FiStar } from 'react-icons/fi';
import { GiCrown } from 'react-icons/gi';
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
  const [districts, setDistricts] = useState([]);
  const [districtSearch, setDistrictSearch] = useState('');
  const watchId = useRef(null);
  const startTime = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setCurrentPos([pos.coords.latitude, pos.coords.longitude]),
      () => setCurrentPos([12.9716, 77.5946]),
      { enableHighAccuracy: true }
    );
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const res = await API.get('/api/districts');
      setDistricts(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        const dur = Math.floor((Date.now() - startTime.current) / 1000);
        setStats(s => ({ ...s, duration: dur }));
        if (quest && !questDone) {
          if (quest.goalType === 'time' && dur >= quest.goalValue) setQuestDone(true);
        }
      }, 1000);
    } else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [running, quest, questDone]);

  useEffect(() => {
    if (quest && !questDone && quest.goalType === 'distance' && stats.distance >= quest.goalValue) {
      setQuestDone(true);
    }
  }, [stats.distance]);

  const startRun = () => {
    setRoute([]); setStats({ distance: 0, duration: 0 }); setQuestDone(false);
    startTime.current = Date.now();
    setRunning(true);
    watchId.current = navigator.geolocation.watchPosition(
      pos => {
        const point = [pos.coords.latitude, pos.coords.longitude];
        setCurrentPos(point);
        setRoute(prev => {
          const nr = [...prev, point];
          setStats(s => ({ ...s, distance: calcDist(nr) }));
          return nr;
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
    const pace = distance > 0 ? parseFloat(((duration/60)/(distance/1000)).toFixed(2)) : 0;
    setLastRunData({
      duration, distance, pace,
      steps: Math.floor(distance * 1.3),
      calories: Math.floor(distance * 0.06),
      route
    });
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
      await fetchDistricts();
      nav('/profile');
    } catch (err) { console.error(err); }
  };

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const filteredDistricts = districts.filter(d =>
    d.name.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const myDonDistricts = districts.filter(d => d.iAmDon);

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20">
      {/* Quest banner */}
      {quest && (
        <div className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold
          ${sinMode ? 'bg-red-950 text-red-300' : 'bg-[#111] text-white'}`}>
          <span>{quest.title}</span>
          <span className="ml-auto">
            {quest.goalType === 'time'
              ? `${fmt(stats.duration)} / ${fmt(quest.goalValue)}`
              : `${(stats.distance/1000).toFixed(2)}km / ${(quest.goalValue/1000).toFixed(1)}km`}
          </span>
          {questDone && <FiCheckCircle className="text-green-400" size={16} />}
        </div>
      )}

      {/* Full screen map */}
      <div className="relative" style={{ height: '100vw', maxHeight: '65vh' }}>
        {currentPos ? (
          <MapContainer center={currentPos} zoom={15} style={{ height:'100%', width:'100%' }} zoomControl={false}>
            <TileLayer
              url={sinMode
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
              attribution='&copy; OpenStreetMap'
            />
            {route.length > 1 && (
              <Polyline positions={route} color={sinMode?'#cc0000':'#111'} weight={5} />
            )}
            <Marker position={currentPos} icon={locationIcon} />
            <RecenterMap position={running ? currentPos : null} />
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-[var(--bg3)]">
            <p className="text-[var(--text2)]">Getting location...</p>
          </div>
        )}

        {/* Floating stats on map */}
        {running && (
          <div className={`absolute top-3 left-3 right-3 z-[1000] rounded-2xl px-4 py-3 flex justify-around
            ${sinMode ? 'bg-black bg-opacity-80 border border-red-900' : 'bg-white bg-opacity-90 shadow-lg'}`}>
            <div className="text-center">
              <p className="text-xs text-[var(--text2)]">Time</p>
              <p className="font-black text-lg text-[var(--text)] tabular-nums">{fmt(stats.duration)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[var(--text2)]">Distance</p>
              <p className="font-black text-lg text-[var(--text)]">{(stats.distance/1000).toFixed(2)} km</p>
            </div>
          </div>
        )}

        {/* Play/Stop button on map */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
          <button onClick={running ? stopRun : startRun}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-4 transition-all active:scale-95
              ${running
                ? 'bg-red-500 border-red-300 animate-pulse'
                : sinMode ? 'bg-red-600 border-red-400' : 'bg-[#111] border-[#444]'}`}>
            {running
              ? <FiSquare size={22} className="text-white" />
              : <FiPlay size={22} className="text-white ml-1" />}
          </button>
        </div>
      </div>

      {/* My districts (don sections) */}
      {myDonDistricts.length > 0 && (
        <div className="px-4 mt-4">
          <p className="text-xs font-bold text-[var(--text2)] uppercase tracking-wider mb-2">
            Your Districts
          </p>
          <div className="flex flex-col gap-2">
            {myDonDistricts.map(d => (
              <div key={d.name} className={`rounded-2xl p-3 flex items-center gap-3 border
                ${sinMode ? 'bg-red-950 border-red-900' : 'bg-[#111] border-transparent'}`}>
                <GiCrown size={20} className="text-yellow-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">{d.name}</p>
                  <p className="text-xs text-gray-400">{(d.myDistance/1000).toFixed(2)} km covered</p>
                </div>
                <span className="text-xs text-yellow-400 font-bold">Don</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All districts */}
      <div className="px-4 mt-4">
        <p className="text-xs font-bold text-[var(--text2)] uppercase tracking-wider mb-2">
          Bangalore Districts
        </p>
        <div className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 mb-3
          ${sinMode ? 'bg-[var(--bg3)] border-[var(--border)]' : 'bg-white border-[var(--border)]'}`}>
          <FiSearch size={16} className="text-[var(--text2)]" />
          <input
            className="flex-1 bg-transparent text-[var(--text)] text-sm outline-none placeholder:text-[var(--text2)]"
            placeholder="Search districts..."
            value={districtSearch}
            onChange={e => setDistrictSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {filteredDistricts.map(d => (
            <div key={d.name} className={`rounded-2xl p-3 border flex items-center gap-3
              ${sinMode ? 'bg-[var(--card)] border-[var(--border)]' : 'bg-white border-[var(--border)] shadow-sm'}`}>
              <div className="flex-1">
                <p className="font-bold text-sm text-[var(--text)]">{d.name}</p>
                <p className="text-xs text-[var(--text2)] mt-0.5">
                  You: {(d.myDistance/1000).toFixed(2)} km
                </p>
              </div>
              <div className="text-right">
                {d.donUsername ? (
                  <div className="flex items-center gap-1">
                    <GiCrown size={12} className="text-yellow-500" />
                    <span className={`text-xs font-bold ${d.iAmDon ? 'text-yellow-500' : 'text-[var(--text2)]'}`}>
                      {d.iAmDon ? 'You' : d.donUsername}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-[var(--text2)]">Not conquered</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save modal — centered, above bottom nav */}
      {showSaveModal && lastRunData && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className={`w-full max-w-sm rounded-3xl p-6 ${sinMode ? 'bg-[#140000]' : 'bg-white'}`}>
            <h2 className="text-xl font-black text-[var(--text)] mb-4 text-center">Save this run?</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label:'Time',     value:fmt(lastRunData.duration) },
                { label:'Distance', value:`${(lastRunData.distance/1000).toFixed(2)} km` },
                { label:'Avg Pace', value:`${lastRunData.pace} min/km` },
                { label:'Steps',    value:lastRunData.steps },
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
                Quest "{quest.title}" completed! +{quest.xp.toLocaleString()} XP
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setShowSaveModal(false); setLastRunData(null); }}
                className="flex-1 py-3.5 rounded-2xl border border-[var(--border)] text-[var(--text)] font-bold">
                Discard
              </button>
              <button onClick={saveRun}
                className={`flex-1 py-3.5 rounded-2xl font-bold text-white ${sinMode?'bg-red-600':'bg-[#111]'}`}>
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
    const φ1 = route[i-1][0]*Math.PI/180, φ2 = route[i][0]*Math.PI/180;
    const Δφ = (route[i][0]-route[i-1][0])*Math.PI/180;
    const Δλ = (route[i][1]-route[i-1][1])*Math.PI/180;
    const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
    total += R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  }
  return Math.floor(total);
}
