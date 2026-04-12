import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SinModeToggle from '../components/SinModeToggle';
import API from '../services/api';
import { useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import logo from '../assets/logo.svg';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function HomePage() {
  const { dbUser } = useAuth();
  const { sinMode } = useTheme();
  const [activeDays, setActiveDays] = useState({});
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    API.get('/api/runs').then(res => {
      const map = {};
      res.data.forEach(r => {
        const d = new Date(r.date || r.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        map[key] = true;
      });
      setActiveDays(map);
    }).catch(() => {});
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date();

  const prevMonth = () => setViewDate(new Date(year, month-1, 1));
  const nextMonth = () => setViewDate(new Date(year, month+1, 1));

  return (
    <div className="min-h-screen pb-20 bg-[var(--bg)]">
      <div className="flex justify-between items-center px-4 pt-5 pb-3">
        <div>
          <p className="text-xs text-[var(--text2)]">Hi there!</p>
          <p className="text-xl font-black text-[var(--text)]">{dbUser?.username || 'User'} 👋</p>
        </div>
        <SinModeToggle />
      </div>

      {/* Logo */}
      <div className="flex justify-center px-4 mb-5">
        <img src={logo} alt="SinCity Stride" className="w-full max-w-xs h-32 object-contain" />
      </div>

      {/* Calendar */}
      <div className="mx-4 rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg3)] text-[var(--text)] hover:opacity-70 transition">
            <FiChevronLeft size={18} />
          </button>
          <p className="font-bold text-[var(--text)]">{MONTHS[month]} {year}</p>
          <button onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg3)] text-[var(--text)] hover:opacity-70 transition">
            <FiChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {['S','M','T','W','T','F','S'].map((d,i) => (
            <p key={i} className="text-[10px] text-[var(--text2)] font-bold pb-1">{d}</p>
          ))}
          {Array.from({ length: firstDay }).map((_,i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_,i) => {
            const day = i+1;
            const key = `${year}-${month}-${day}`;
            const isActive = activeDays[key];
            const isToday = day===today.getDate() && month===today.getMonth() && year===today.getFullYear();
            return (
              <div key={day} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold
                ${isToday
                  ? sinMode ? 'bg-red-600 text-white' : 'bg-[#111] text-white'
                  : isActive
                    ? sinMode ? 'bg-red-900 text-red-200' : 'bg-green-500 text-white'
                    : 'text-[#aaa]'}`}>
                {day}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-sm ${sinMode?'bg-red-900':'bg-green-500'}`} />
              <span className="text-[var(--text2)]">Active</span>
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-sm ${sinMode?'bg-red-600':'bg-[#111]'}`} />
              <span className="text-[var(--text2)]">Today</span>
            </span>
          </div>
          <p className="text-xs font-bold text-[var(--text2)]">
            🔥 {dbUser?.streak||0} day streak
          </p>
        </div>
      </div>
    </div>
  );
}
