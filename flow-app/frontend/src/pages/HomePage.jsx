import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SinModeToggle from '../components/SinModeToggle';
import API from '../services/api';
import { useEffect, useState } from 'react';

function getCalendarDays() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  return { daysInMonth, firstDay, today: today.getDate(), month, year };
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function HomePage() {
  const { dbUser } = useAuth();
  const { sinMode } = useTheme();
  const [activeDays, setActiveDays] = useState([]);
  const cal = getCalendarDays();

  useEffect(() => {
    API.get('/api/runs').then(res => {
      const days = res.data.map(r => new Date(r.date || r.createdAt).getDate());
      setActiveDays([...new Set(days)]);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen pb-20 bg-[var(--bg)]">
      {/* Top bar */}
      <div className="flex justify-between items-center px-4 pt-5 pb-3">
        <div>
          <p className="text-xs text-[var(--text2)]">Hi there!</p>
          <p className="text-xl font-black text-[var(--text)]">{dbUser?.username || 'User'} 👋</p>
        </div>
        <SinModeToggle />
      </div>

      {/* App name banner */}
      <div className={`mx-4 mb-4 rounded-2xl p-4 flex items-center justify-between
        ${sinMode ? 'bg-red-950 border border-red-900' : 'bg-[#111] text-white'}`}>
        <div>
          <p className="text-white font-black text-lg">SinCity Stride</p>
          <p className={`text-xs mt-0.5 ${sinMode ? 'text-red-300' : 'text-gray-300'}`}>
            {sinMode ? 'Conquer. Dominate. Rise.' : 'Your fitness journey starts here.'}
          </p>
        </div>
        <span className="text-3xl">{sinMode ? '⚔️' : '🏃'}</span>
      </div>

      {/* Stats 2x2 */}
      <div className="grid grid-cols-2 gap-3 mx-4 mb-5">
        {[
          { label: 'Level',   value: dbUser?.level  || 1,   icon: '⭐' },
          { label: 'XP',      value: dbUser?.xp     || 0,   icon: '💫' },
          { label: 'Streak',  value: `${dbUser?.streak || 0}d`, icon: '🔥' },
          { label: 'Calories',value: `${dbUser?.stats?.totalCalories || 0}`, icon: '⚡' }
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)]">
            <p className="text-xl">{icon}</p>
            <p className="text-xs text-[var(--text2)] mt-1">{label}</p>
            <p className="text-2xl font-black text-[var(--text)] mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Activity Calendar */}
      <div className="mx-4 rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)]">
        <p className="font-bold text-[var(--text)] mb-3">
          {MONTH_NAMES[cal.month]} {cal.year} — Activity
        </p>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['S','M','T','W','T','F','S'].map((d,i) => (
            <p key={i} className="text-[10px] text-[var(--text2)] font-bold pb-1">{d}</p>
          ))}
          {Array.from({ length: cal.firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: cal.daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isActive = activeDays.includes(day);
            const isToday = day === cal.today;
            return (
              <div key={day} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition
                ${isToday
                  ? sinMode ? 'bg-red-600 text-white' : 'bg-[#111] text-white'
                  : isActive
                    ? sinMode ? 'bg-red-900 text-red-300' : 'bg-green-100 text-green-700'
                    : 'text-[var(--text2)]'}`}>
                {day}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-[var(--text2)] mt-3 text-center">
          {activeDays.length} active days this month
        </p>
      </div>
    </div>
  );
}
