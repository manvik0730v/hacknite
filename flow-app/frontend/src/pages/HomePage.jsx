import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { logout } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { dbUser, user } = useAuth();
  const { sinMode, setSinMode } = useTheme();
  const nav = useNavigate();

  const handleLogout = async () => {
    await logout();
    nav('/');
  };

  return (
    <div className={`min-h-screen pb-20 ${sinMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex justify-between items-center p-4">
        <div>
          <p className="text-sm text-gray-500">Hi!</p>
          <p className="text-xl font-bold">{dbUser?.username || user?.displayName || 'User'}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setSinMode(!sinMode)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition ${
              sinMode ? 'bg-cyan-400 text-black' : 'bg-gray-800 text-white'}`}>
            {sinMode ? '⚡ SIN' : 'NORMAL'}
          </button>
          <button onClick={handleLogout}
            className="px-3 py-2 rounded-full text-sm bg-red-500 text-white font-bold hover:bg-red-600 transition">
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mx-4 mb-6">
        {[
          { label: 'Steps Today', value: 0 },
          { label: 'Level', value: dbUser?.level || 1 },
          { label: 'Streak 🔥', value: `${dbUser?.streak || 0} days` },
          { label: 'Calories', value: '0 kcal' }
        ].map(({ label, value }) => (
          <div key={label} className={`rounded-2xl p-4 ${sinMode ? 'bg-gray-900 border border-cyan-900' : 'bg-white shadow'}`}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
