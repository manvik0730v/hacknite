import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { logout } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiLogOut, FiZap } from 'react-icons/fi';
import { GiCrown } from 'react-icons/gi';
import { getLevel, xpToNextLevel } from '../utils/level';
import API from '../services/api';

export default function ProfilePage() {
  const { user, dbUser, refreshUser } = useAuth();
  const { sinMode } = useTheme();
  const nav = useNavigate();
  const [runs, setRuns] = useState([]);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [districtCount, setDistrictCount] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchRuns(); fetchDistricts(); }, []);

  useEffect(() => {
    if (dbUser) setEditData({
      username: dbUser.username || '',
      height: dbUser.height || '',
      weight: dbUser.weight || '',
      gender: dbUser.gender || '',
      profilePhoto: dbUser.profilePhoto || ''
    });
  }, [dbUser]);

  const fetchRuns = async () => {
    try { const res = await API.get('/api/runs'); setRuns(res.data); }
    catch (err) { console.error(err); }
    finally { setLoadingRuns(false); }
  };

  const fetchDistricts = async () => {
    try {
      const res = await API.get('/api/districts');
      setDistrictCount(res.data.filter(d => d.iAmDon).length);
    } catch (err) { console.error(err); }
  };

  const handlePfpChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setEditData(d => ({ ...d, profilePhoto: reader.result }));
    reader.readAsDataURL(file);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await API.post('/api/auth/login', { ...editData, onboardingDone: true });
      await refreshUser();
      setEditing(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const deleteRun = async (id) => {
    setDeletingId(id);
    try {
      await API.delete(`/api/runs/${id}`);
      setRuns(prev => prev.filter(r => r._id !== id));
    } catch (err) { console.error(err); }
    finally { setDeletingId(null); }
  };

  const xp = dbUser?.xp || 0;
  const level = getLevel(xp);
  const xpInfo = xpToNextLevel(xp);
  const xpProgress = Math.min((xpInfo.current / xpInfo.needed) * 100, 100);

  const fmt = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  const inputCls = "w-full bg-[var(--bg3)] text-[var(--text)] border border-[var(--border)] rounded-xl p-3 outline-none transition text-sm";
  const accent = sinMode ? 'bg-red-600' : 'bg-blue-600';

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 pt-5 flex flex-col gap-4">
        <h1 className="text-2xl font-black text-[var(--text)]">Profile</h1>

        {/* Profile card */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden border-2 border-[var(--border)]"
                style={{ background: sinMode ? 'linear-gradient(135deg,#3d0000,#1a0000)' : 'linear-gradient(135deg,#1a56db,#3b7ef8)' }}>
                {(editing ? editData.profilePhoto : dbUser?.profilePhoto)
                  ? <img src={editing ? editData.profilePhoto : dbUser.profilePhoto} className="w-full h-full object-cover" />
                  : <span className="text-white text-3xl font-black">{(dbUser?.username||'U')[0].toUpperCase()}</span>}
              </div>
              <button onClick={() => fileInputRef.current.click()}
                className={`absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center shadow border-2 border-[var(--bg)] text-white btn-lift ${accent}`}>
                <FiEdit2 size={12} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePfpChange} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-lg font-black text-[var(--text)] truncate">{dbUser?.username}</p>
              <p className="text-[var(--text2)] text-xs truncate">{user?.email}</p>
              {/* Level + XP + Streak */}
              <div className="flex gap-2 mt-1.5 flex-wrap">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sinMode?'bg-red-950 text-red-300':'bg-blue-100 text-blue-700'}`}>
                  Level {level}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${sinMode?'bg-red-950 text-red-300':'bg-blue-50 text-blue-600'}`}>
                  <FiZap size={10} className="text-yellow-500" />{xp} XP
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--bg3)] text-[var(--text2)]">
                  🔥 {dbUser?.streak||0}d
                </span>
              </div>
            </div>

            <button onClick={() => setEditing(!editing)}
              className="px-3 py-1.5 rounded-xl glass-card text-[var(--text)] text-sm font-bold btn-lift flex-shrink-0">
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* XP progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-[var(--text2)] mb-1">
              <span>Progress to {xpInfo.label}</span>
              <span>{xpInfo.current} / {xpInfo.needed}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--bg3)]">
              <div className={`h-2 rounded-full transition-all ${sinMode?'bg-red-500':'bg-blue-500'}`}
                style={{ width: `${xpProgress}%` }} />
            </div>
          </div>

          {/* Info pills */}
          {!editing && (
            <div className="flex gap-2 flex-wrap">
              {dbUser?.gender && <span className="px-3 py-1 rounded-full bg-[var(--bg3)] text-[var(--text2)] text-xs">{dbUser.gender}</span>}
              {dbUser?.height && <span className="px-3 py-1 rounded-full bg-[var(--bg3)] text-[var(--text2)] text-xs">{dbUser.height} cm</span>}
              {dbUser?.weight && <span className="px-3 py-1 rounded-full bg-[var(--bg3)] text-[var(--text2)] text-xs">{dbUser.weight} kg</span>}
              {!dbUser?.gender && !dbUser?.height && !dbUser?.weight &&
                <span className="text-[var(--text2)] text-xs">Tap Edit to add stats</span>}
            </div>
          )}

          {/* Edit form */}
          {editing && (
            <div className="flex flex-col gap-3 mt-3 border-t border-[var(--border)] pt-3">
              <input className={inputCls} placeholder="Username" value={editData.username}
                onChange={e => setEditData(d => ({ ...d, username: e.target.value }))} />
              <div className="flex gap-2">
                {['Male','Female','Other'].map(g => (
                  <button key={g} onClick={() => setEditData(d => ({ ...d, gender: d.gender===g?'':g }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition btn-lift
                      ${editData.gender===g ? `${accent} text-white border-transparent` : 'bg-[var(--bg3)] text-[var(--text)] border-[var(--border)]'}`}>
                    {g}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input className={inputCls} placeholder="Height (cm)" type="number"
                  value={editData.height} onChange={e => setEditData(d => ({ ...d, height: e.target.value }))} />
                <input className={inputCls} placeholder="Weight (kg)" type="number"
                  value={editData.weight} onChange={e => setEditData(d => ({ ...d, weight: e.target.value }))} />
              </div>
              <button onClick={saveEdit} disabled={saving}
                className={`w-full text-white font-bold py-3 rounded-xl disabled:opacity-40 btn-lift ${accent}`}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* All time records */}
        <div className="glass-card p-4">
          <p className="font-bold text-[var(--text)] mb-3">All Time Records</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:'Longest Run', value:`${((dbUser?.stats?.longestRun||0)/1000).toFixed(2)} km` },
              { label:'Best Pace',   value:`${dbUser?.stats?.bestPace||0} min/km` },
              { label:'Streak',      value:`${dbUser?.streak||0} days` },
              { label:'Districts as Don', value: districtCount, icon: <GiCrown size={12} className="text-yellow-500 mr-1 inline" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className={`rounded-xl p-3 btn-lift ${sinMode?'bg-red-950 border border-red-900':'bg-blue-50 border border-blue-100'}`}>
                <p className="text-xs text-[var(--text2)]">{label}</p>
                <p className="font-black mt-1 text-[var(--text)]">{icon}{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* My Runs */}
        <div className="glass-card p-4">
          <p className="font-bold text-[var(--text)] mb-3">My Runs ({runs.length})</p>
          {loadingRuns ? (
            <p className="text-[var(--text2)] text-sm text-center py-4">Loading...</p>
          ) : runs.length === 0 ? (
            <p className="text-[var(--text2)] text-sm text-center py-4">No runs yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {runs.map(run => (
                <div key={run._id} className={`rounded-xl p-3 flex gap-3 items-start btn-lift ${sinMode?'bg-red-950 border border-red-900':'bg-blue-50 border border-blue-100'}`}>
                  <div className="flex-1">
                    <p className="text-xs text-[var(--text2)] mb-1.5">{fmtDate(run.date||run.createdAt)}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {[
                        { l:'Distance', v:`${(run.distance/1000).toFixed(2)} km` },
                        { l:'Time',     v:fmt(run.duration) },
                        { l:'Avg Pace', v:`${run.pace?.toFixed(2)||'—'} /km` },
                        { l:'Steps',    v:run.steps||'—' },
                      ].map(({ l, v }) => (
                        <div key={l}>
                          <p className="text-xs text-[var(--text2)]">{l}</p>
                          <p className="font-bold text-sm text-[var(--text)]">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => deleteRun(run._id)} disabled={deletingId===run._id}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 transition disabled:opacity-40 flex-shrink-0 btn-lift">
                    {deletingId===run._id ? '...' : <FiTrash2 size={14} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={async () => { await logout(); nav('/'); }}
          className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl hover:bg-red-600 transition flex items-center justify-center gap-2 text-base btn-lift">
          <FiLogOut size={18} /> Log Out
        </button>
      </div>
    </div>
  );
}
