import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function HomePage() {
  const { dbUser } = useAuth();
  const { sinMode } = useTheme();

  return (
    <div className="min-h-screen pb-20 bg-[var(--bg)]">
      <div className="flex justify-between items-center p-4">
        <div>
          <p className="text-sm text-[var(--text2)]">Hi!</p>
          <p className="text-xl font-bold text-[var(--text)]">{dbUser?.username || 'User'}</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-2 gap-3 mx-4 mb-6">
        {[
          { label: 'Steps Today', value: 0, icon: '👟' },
          { label: 'Level', value: dbUser?.level || 1, icon: '⭐' },
          { label: 'Streak', value: `${dbUser?.streak || 0}d`, icon: '🔥' },
          { label: 'Calories', value: '0 kcal', icon: '⚡' }
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)]">
            <p className="text-xl mb-1">{icon}</p>
            <p className="text-xs text-[var(--text2)]">{label}</p>
            <p className="text-2xl font-bold mt-1 text-[var(--text)]">{value}</p>
          </div>
        ))}
      </div>

      {sinMode && (
        <div className="mx-4 mb-6 rounded-2xl p-4 bg-red-950 border border-red-800">
          <p className="text-red-400 font-bold text-sm">⚔️ SIN CITY MODE ACTIVE</p>
          <p className="text-red-300 text-xs mt-1">Conquer regions. Challenge rivals. Rise.</p>
        </div>
      )}
    </div>
  );
}
