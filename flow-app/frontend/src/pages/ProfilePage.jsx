import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { logout } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
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
  const fileInputRef = useRef(null);

  useEffect(() => { fetchRuns(); }, []);

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
    try {
      const res = await API.get('/api/runs');
      setRuns(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingRuns(false); }
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

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

  const inputCls = "w-full bg-[var(--bg3)] text-[var(--text)] border border-[var(--border)] rounded-xl p-3 outline-none focus:border-[var(--accent)] transition text-sm";
  const card = "rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)]";

  return (
    <div className="min-h-screen pb-24 bg-[var(--bg)]">
      <div className="px-4 pt-5 flex flex-col gap-4">
        <h1 className="text-2xl font-black text-[var(--text)]">Profile</h1>

        {/* Profile card */}
        <div className={card}>
          <div className="flex items-center gap-4 mb-3">
            {/* Avatar with pencil */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-[var(--accent)] flex items-center justify-center overflow-hidden border-2 border-[var(--border)]">
                {(editing ? editData.profilePhoto : dbUser?.profilePhoto)
                  ? <img src={editing ? editData.profilePhoto : dbUser.profilePhoto} className="w-full h-full object-cover" />
                  : <span className="text-white text-3xl font-black">{(dbUser?.username||'U')[0].toUpperCase()}</span>}
              </div>
              <button onClick={() => fileInputRef.current.click()}
                className={`absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-sm shadow border-2 border-[var(--bg)] text-white
                  ${sinMode ? 'bg-red-600' : 'bg-[#111]'}`}>
                ✏️
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePfpChange} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-lg font-black text-[var(--text)] truncate">{dbUser?.username}</p>
              <p className="text-[var(--text2)] text-xs truncate">{user?.email}</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sinMode ? 'bg-red-950 text-red-300' : 'bg-[#f0f0f0] text-[#555]'}`}>
                  Lv.{dbUser?.level||1}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sinMode ? 'bg-red-950 text-red-300' : 'bg-[#f0f0f0] text-[#555]'}`}>
                  {dbUser?.xp||0} XP
                </span>
              </div>
            </div>
            <button onClick={() => setEditing(!editing)}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg3)] text-[var(--text)] text-sm font-bold border border-[var(--border)]">
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Info pills */}
          {!editing && (
            <div className="flex gap-2 flex-wrap">
              {dbUser?.gender && <span className="px-3 py-1 rounded-full bg-[var(--bg3)] text-[var(--text2)] text-xs">{dbUser.gender}</span>}
              {dbUser?.height && <span className="px-3 py-1 rounded-full bg-[var(--bg3)] text-[var(--text2)] text-xs">{dbUser.height} cm</span>}
              {dbUser?.weight && <span className="px-3 py-1 rounded-full bg-[var(--bg3)] text-[var(--text2)] text-xs">{dbUser.weight} kg</span>}
              {!dbUser?.gender && !dbUser?.height && !dbUser?.weight &&
                <span className="text-[var(--text2)] text-xs">Tap Edit to add your stats</span>}
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
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition
                      ${editData.gender===g ? sinMode?'bg-red-600 text-white border-red-600':'bg-[#111] text-white border-[#111]' : 'bg-[var(--bg3)] text-[var(--text)] border-[var(--border)]'}`}>
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
                className={`w-full text-white font-bold py-3 rounded-xl disabled:opacity-40 transition ${sinMode?'bg-red-600':'bg-[#111]'}`}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* All time records */}
        <div className={card}>
          <p className="font-bold text-[var(--text)] mb-3">All Time Records</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:'Longest Run',     value:`${((dbUser?.stats?.longestRun||0)/1000).toFixed(2)} km` },
              { label:'Best Pace',       value:`${dbUser?.stats?.bestPace||0} min/km` },
              { label:'Streak',          value:`${dbUser?.streak||0} days` },
              { label:'Total Calories',  value:`${dbUser?.stats?.totalCalories||0} kcal` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl p-3 bg-[var(--bg3)]">
                <p className="text-xs text-[var(--text2)]">{label}</p>
                <p className="font-black mt-1 text-[var(--text)]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* My Runs */}
        <div className={card}>
          <p className="font-bold text-[var(--text)] mb-3">My Runs ({runs.length})</p>
          {loadingRuns ? (
            <p className="text-[var(--text2)] text-sm text-center py-4">Loading...</p>
          ) : runs.length === 0 ? (
            <p className="text-[var(--text2)] text-sm text-center py-4">No runs yet. Start your first run!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {runs.map(run => (
                <div key={run._id} className="rounded-xl p-3 flex justify-between items-center bg-[var(--bg3)]">
                  <div className="flex-1">
                    <p className="text-xs text-[var(--text2)] mb-1">{fmtDate(run.date||run.createdAt)}</p>
                    <div className="flex gap-3 flex-wrap">
                      {[
                        { l:'Distance', v:`${(run.distance/1000).toFixed(2)} km` },
                        { l:'Time',     v:fmt(run.duration) },
                        { l:'Pace',     v:`${run.pace?.toFixed(2)||'—'} min/km` },
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
                    className="ml-3 w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition disabled:opacity-40 text-sm font-bold flex-shrink-0">
                    {deletingId===run._id ? '...' : '✕'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <button onClick={async () => { await logout(); nav('/'); }}
          className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl hover:bg-red-600 transition text-lg">
          Log Out
        </button>
      </div>
    </div>
  );
}
