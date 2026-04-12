import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { logout } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function ProfilePage() {
  const { user, dbUser } = useAuth();
  const { sinMode } = useTheme();
  const nav = useNavigate();
  const [runs, setRuns] = useState([]);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchRuns();
  }, []);

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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const bg = sinMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900';
  const card = sinMode ? 'bg-gray-900 border border-gray-800' : 'bg-white shadow';

  return (
    <div className={`min-h-screen pb-24 ${bg}`}>
      {/* Header */}
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-5">Profile</h1>

        {/* Profile card */}
        <div className={`rounded-2xl p-4 mb-4 ${card}`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
              {(dbUser?.username || user?.displayName || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold">{dbUser?.username || user?.displayName}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <p className={`text-xs mt-1 font-bold ${sinMode ? 'text-cyan-400' : 'text-indigo-500'}`}>
                Level {dbUser?.level || 1}
              </p>
            </div>
          </div>
        </div>

        {/* All-time stats */}
        <div className={`rounded-2xl p-4 mb-4 ${card}`}>
          <p className="font-bold mb-3">All Time Records</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Longest Run', value: `${((dbUser?.stats?.longestRun || 0) / 1000).toFixed(2)} km` },
              { label: 'Best Pace', value: `${dbUser?.stats?.bestPace || 0} min/km` },
              { label: 'Regions Captured', value: dbUser?.stats?.regionsCapture || 0 },
              { label: 'Total Calories', value: `${dbUser?.stats?.totalCalories || 0} kcal` }
            ].map(({ label, value }) => (
              <div key={label} className={`rounded-xl p-3 ${sinMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-bold mt-1">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* My Runs */}
        <div className={`rounded-2xl p-4 mb-4 ${card}`}>
          <p className="font-bold mb-3">My Runs ({runs.length})</p>
          {loadingRuns ? (
            <p className="text-gray-400 text-sm text-center py-4">Loading runs...</p>
          ) : runs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No runs yet. Start your first run!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {runs.map(run => (
                <div key={run._id}
                  className={`rounded-xl p-3 flex justify-between items-center ${sinMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-1">{formatDate(run.date || run.createdAt)}</p>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Distance</p>
                        <p className="font-bold text-sm">{(run.distance / 1000).toFixed(2)} km</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Time</p>
                        <p className="font-bold text-sm">{formatTime(run.duration)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Pace</p>
                        <p className="font-bold text-sm">{run.pace?.toFixed(2) || '—'} min/km</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Cal</p>
                        <p className="font-bold text-sm">{run.calories}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRun(run._id)}
                    disabled={deletingId === run._id}
                    className="ml-3 w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition disabled:opacity-40 text-sm font-bold">
                    {deletingId === run._id ? '...' : '✕'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition">
          Log Out
        </button>
      </div>
    </div>
  );
}
