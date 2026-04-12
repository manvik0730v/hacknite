import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
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

  useEffect(() => {
    fetchRuns();
  }, []);

  useEffect(() => {
    if (dbUser) {
      setEditData({
        username: dbUser.username || '',
        height: dbUser.height || '',
        weight: dbUser.weight || '',
        gender: dbUser.gender || '',
        profilePhoto: dbUser.profilePhoto || ''
      });
    }
  }, [dbUser]);

  const fetchRuns = async () => {
    try {
      const res = await API.get('/api/runs');
      setRuns(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRuns(false);
    }
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await API.post('/api/auth/login', { ...editData, onboardingDone: true });
      await refreshUser();
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteRun = async (id) => {
    setDeletingId(id);
    try {
      await API.delete(`/api/runs/${id}`);
      setRuns(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    nav('/');
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const inputClass = "w-full bg-[var(--bg3)] text-[var(--text)] border border-[var(--border)] rounded-xl p-3 outline-none focus:border-[var(--accent)] transition text-sm";

  return (
    <div className="min-h-screen pb-24 bg-[var(--bg)]">
      <div className="p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[var(--text)]">Profile</h1>
          <ThemeToggle />
        </div>

        {/* Profile card */}
        <div className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center overflow-hidden border-2 border-[var(--accent)]">
              {dbUser?.profilePhoto
                ? <img src={dbUser.profilePhoto} className="w-full h-full object-cover" alt="avatar" />
                : <span className="text-white text-2xl font-bold">
                    {(dbUser?.username || 'U')[0].toUpperCase()}
                  </span>
              }
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-[var(--text)]">{dbUser?.username}</p>
              <p className="text-[var(--text2)] text-sm">{user?.email}</p>
              <p className="text-[var(--accent)] text-xs font-bold mt-0.5">Level {dbUser?.level || 1}</p>
            </div>
            <button onClick={() => setEditing(!editing)}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg3)] text-[var(--text)] text-sm font-bold border border-[var(--border)]">
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Stats pills */}
          {!editing && (
            <div className="flex gap-2 flex-wrap">
              {dbUser?.gender && (
                <span className="px-3 py-1 rounded-full bg-[var(--bg3)] text-[var(--text2)] text-xs">{dbUser.gender}</span>
              )}
              {dbUser?.height && (
                <span className="px-3 py-1 rounded-full bg-[var(--bg3)] text-[var(--text2)] text-xs">{dbUser.height} cm</span>
              )}
              {dbUser?.weight && (
                <span className="px-3 py-1 rounded-full bg-[var(--bg3)] text-[var(--text2)] text-xs">{dbUser.weight} kg</span>
              )}
              {!dbUser?.gender && !dbUser?.height && !dbUser?.weight && (
                <span className="text-[var(--text2)] text-xs">No stats added yet — tap Edit</span>
              )}
            </div>
          )}

          {/* Edit form */}
          {editing && (
            <div className="flex flex-col gap-3 mt-3">
              <input className={inputClass} placeholder="Username"
                value={editData.username} onChange={e => setEditData(d => ({ ...d, username: e.target.value }))} />
              <input className={inputClass} placeholder="Profile photo URL"
                value={editData.profilePhoto} onChange={e => setEditData(d => ({ ...d, profilePhoto: e.target.value }))} />
              <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map(g => (
                  <button key={g} onClick={() => setEditData(d => ({ ...d, gender: g }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition
                      ${editData.gender === g
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                        : 'bg-[var(--bg3)] text-[var(--text)] border-[var(--border)]'}`}>
                    {g}
                  </button>
                ))}
                <button onClick={() => setEditData(d => ({ ...d, gender: '' }))}
                  className="px-3 py-2 rounded-xl text-sm border border-[var(--border)] text-[var(--text2)]">
                  Clear
                </button>
              </div>
              <div className="flex gap-2">
                <input className={inputClass} placeholder="Height (cm)" type="number"
                  value={editData.height} onChange={e => setEditData(d => ({ ...d, height: e.target.value }))} />
                <input className={inputClass} placeholder="Weight (kg)" type="number"
                  value={editData.weight} onChange={e => setEditData(d => ({ ...d, weight: e.target.value }))} />
              </div>
              <button onClick={saveEdit} disabled={saving}
                className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded-xl disabled:opacity-40 transition">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* All time records */}
        <div className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)]">
          <p className="font-bold mb-3 text-[var(--text)]">All Time Records</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Longest Run', value: `${((dbUser?.stats?.longestRun || 0) / 1000).toFixed(2)} km` },
              { label: 'Best Pace', value: `${dbUser?.stats?.bestPace || 0} min/km` },
              { label: 'Regions Captured', value: dbUser?.stats?.regionsCapture || 0 },
              { label: 'Total Calories', value: `${dbUser?.stats?.totalCalories || 0} kcal` }
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl p-3 bg-[var(--bg3)]">
                <p className="text-xs text-[var(--text2)]">{label}</p>
                <p className="font-bold mt-1 text-[var(--text)]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* My Runs */}
        <div className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)]">
          <p className="font-bold mb-3 text-[var(--text)]">My Runs ({runs.length})</p>
          {loadingRuns ? (
            <p className="text-[var(--text2)] text-sm text-center py-4">Loading runs...</p>
          ) : runs.length === 0 ? (
            <p className="text-[var(--text2)] text-sm text-center py-4">No runs yet. Start your first run!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {runs.map(run => (
                <div key={run._id}
                  className="rounded-xl p-3 flex justify-between items-center bg-[var(--bg3)]">
                  <div className="flex-1">
                    <p className="text-xs text-[var(--text2)] mb-1">{formatDate(run.date || run.createdAt)}</p>
                    <div className="flex gap-3 flex-wrap">
                      {[
                        { label: 'Distance', value: `${(run.distance / 1000).toFixed(2)} km` },
                        { label: 'Time', value: formatTime(run.duration) },
                        { label: 'Pace', value: `${run.pace?.toFixed(2) || '—'} min/km` },
                        { label: 'Cal', value: run.calories }
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-xs text-[var(--text2)]">{label}</p>
                          <p className="font-bold text-sm text-[var(--text)]">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => deleteRun(run._id)} disabled={deletingId === run._id}
                    className="ml-3 w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition disabled:opacity-40 text-sm font-bold">
                    {deletingId === run._id ? '...' : '✕'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout at the bottom */}
        <button onClick={handleLogout}
          className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl hover:bg-red-600 transition text-lg mt-2">
          Log Out
        </button>
      </div>
    </div>
  );
}
