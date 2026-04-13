import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SinModeToggle from '../components/SinModeToggle';
import API from '../services/api';
import { useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import logo from '../assets/logo.svg';
import logo2 from '../assets/logo2.svg';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export default function HomePage() {
  const { dbUser } = useAuth();
  const { sinMode } = useTheme();
  const [activeDays, setActiveDays] = useState({});
  const [runsByDay, setRunsByDay] = useState({});
  const [allRuns, setAllRuns] = useState([]);
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(today.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(today.getMonth());

  useEffect(() => {
    API.get('/api/runs').then(res => {
      const map = {};
      const byDay = {};
      res.data.forEach(r => {
        const d = new Date(r.date || r.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        map[key] = true;
        if (!byDay[key]) byDay[key] = [];
        byDay[key].push(r);
      });
      setActiveDays(map);
      setRunsByDay(byDay);
      setAllRuns(res.data);
    }).catch(() => {});
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(null);
  };

  const selectDay = (day) => {
    const key = `${year}-${month}-${day}`;
    setSelectedDate({ year, month, day, key });
  };

  const applyDatePicker = () => {
    setViewDate(new Date(pickerYear, pickerMonth, 1));
    setShowDatePicker(false);
    setSelectedDate(null);
  };

  const selectedRuns = selectedDate ? (runsByDay[selectedDate.key] || []) : [];

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const accentColor = sinMode ? 'text-red-400' : 'text-blue-600';
  const activeBg = sinMode ? 'bg-red-900 text-red-200' : 'bg-blue-500 text-white';
  const todayBg = sinMode ? 'bg-red-600 text-white ring-2 ring-red-400' : 'bg-blue-700 text-white ring-2 ring-blue-400';
  const selectedBg = sinMode ? 'bg-red-800 text-white ring-2 ring-red-300' : 'bg-blue-400 text-white ring-2 ring-blue-300';

  return (
    <div className="min-h-screen pb-20">
      {/* Top bar */}
      <div className="flex justify-between items-center px-4 pt-5 pb-3">
        <div>
          <p className={`text-xs ${sinMode ? 'text-red-300' : 'text-blue-400'}`}>Hi there!</p>
          <p className="text-xl font-black text-[var(--text)]">{dbUser?.username || 'User'} 👋</p>
        </div>
        <SinModeToggle />
      </div>

      {/* Logo */}
      <div className="flex justify-center px-6 mb-5">
        <img src={sinMode ? logo : logo2} alt="SinCity Stride" className="w-full max-w-xs h-28 object-contain drop-shadow-lg" />
      </div>

      {/* Calendar card */}
      <div className="mx-4 glass-card p-4 mb-4">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full glass-card text-[var(--text)]">
            <FiChevronLeft size={16} />
          </button>
          <button onClick={() => setShowDatePicker(true)}
            className={`font-bold text-[var(--text)] hover:${accentColor} transition text-sm`}>
            {MONTHS[month]} {year}
          </button>
          <button onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full glass-card text-[var(--text)]">
            <FiChevronRight size={16} />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {['S','M','T','W','T','F','S'].map((d,i) => (
            <p key={i} className={`text-[10px] font-bold pb-1 ${sinMode ? 'text-red-400' : 'text-blue-400'}`}>{d}</p>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: firstDay }).map((_,i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_,i) => {
            const day = i + 1;
            const key = `${year}-${month}-${day}`;
            const isActive = activeDays[key];
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isSelected = selectedDate?.key === key;
            return (
              <button key={day} onClick={() => selectDay(day)}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all hover:scale-110
                  ${isSelected ? selectedBg : isToday ? todayBg : isActive ? activeBg : 'text-[var(--text2)] hover:bg-[var(--bg3)]'}`}>
                {isToday ? '•' : day}
              </button>
            );
          })}
        </div>

        {/* Legend + today button */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-sm ${sinMode?'bg-red-900':'bg-blue-500'}`} />
              <span className="text-[var(--text2)]">Active</span>
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-sm ${sinMode?'bg-red-600':'bg-blue-700'}`} />
              <span className="text-[var(--text2)]">Today</span>
            </span>
          </div>
          <button onClick={goToday}
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg btn-lift
              ${sinMode ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
            <FiRefreshCw size={10} /> Today
          </button>
        </div>
      </div>

      {/* Selected day runs */}
      {selectedDate && (
        <div className="mx-4 glass-card p-4 mb-4 scroll-zoom-section">
          <p className="font-bold text-[var(--text)] mb-3">
            {MONTHS[selectedDate.month]} {selectedDate.day}, {selectedDate.year}
          </p>
          {selectedRuns.length === 0 ? (
            <p className="text-[var(--text2)] text-sm text-center py-3">No runs on this day</p>
          ) : (
            <div className="flex flex-col gap-3">
              {selectedRuns.map(run => (
                <div key={run._id} className={`rounded-xl p-3 ${sinMode ? 'bg-[var(--bg3)]' : 'bg-blue-50'}`}>
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* Date picker modal */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className={`w-full max-w-xs rounded-3xl p-6 ${sinMode ? 'bg-[#140000]' : 'bg-white'}`}>
            <h3 className="font-black text-[var(--text)] text-lg mb-4 text-center">Jump to Date</h3>
            <div className="flex gap-3 mb-5">
              {/* Year picker */}
              <div className="flex-1">
                <p className="text-xs text-[var(--text2)] mb-1 text-center">Year</p>
                <div className="h-40 overflow-y-auto rounded-xl bg-[var(--bg3)] border border-[var(--border)]">
                  {Array.from({ length: 2060 - 1960 + 1 }, (_,i) => 1960 + i).map(y => (
                    <button key={y} onClick={() => setPickerYear(y)}
                      className={`w-full py-2 text-sm font-bold transition
                        ${pickerYear === y
                          ? sinMode ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                          : 'text-[var(--text)] hover:bg-[var(--bg2)]'}`}>
                      {y}
                    </button>
                  ))}
                </div>
              </div>
              {/* Month picker */}
              <div className="flex-1">
                <p className="text-xs text-[var(--text2)] mb-1 text-center">Month</p>
                <div className="h-40 overflow-y-auto rounded-xl bg-[var(--bg3)] border border-[var(--border)]">
                  {MONTHS.map((m, i) => (
                    <button key={m} onClick={() => setPickerMonth(i)}
                      className={`w-full py-2 text-xs font-bold transition
                        ${pickerMonth === i
                          ? sinMode ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                          : 'text-[var(--text)] hover:bg-[var(--bg2)]'}`}>
                      {m.slice(0,3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDatePicker(false)}
                className="flex-1 py-3 rounded-2xl border border-[var(--border)] text-[var(--text)] font-bold">
                Cancel
              </button>
              <button onClick={applyDatePicker}
                className={`flex-1 py-3 rounded-2xl font-bold text-white ${sinMode?'bg-red-600':'bg-blue-600'}`}>
                Go
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
