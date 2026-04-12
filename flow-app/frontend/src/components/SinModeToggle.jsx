import { useTheme } from '../context/ThemeContext';

export default function SinModeToggle() {
  const { sinMode, setSinMode } = useTheme();
  return (
    <button onClick={() => setSinMode(!sinMode)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-bold
        ${sinMode ? 'bg-red-600 border-red-800 text-white' : 'bg-[var(--bg3)] border-[var(--border)] text-[var(--text)]'}`}>
      <div className={`w-8 h-4 rounded-full relative transition-colors ${sinMode ? 'bg-red-400' : 'bg-gray-300'}`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${sinMode ? 'left-4' : 'left-0.5'}`} />
      </div>
      {sinMode ? 'SIN' : 'UPTOWN'}
    </button>
  );
}
