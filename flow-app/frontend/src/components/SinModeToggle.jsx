import { useTheme } from '../context/ThemeContext';

export default function SinModeToggle() {
  const { sinMode, setSinMode } = useTheme();
  return (
    <button onClick={() => setSinMode(!sinMode)}
      style={{ minWidth: '120px' }}
      className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-full border transition-colors text-xs font-bold
        ${sinMode ? 'bg-red-600 border-red-800 text-white' : 'bg-[var(--bg3)] border-[var(--border)] text-[var(--text)]'}`}>
      <span className="w-16 text-center">{sinMode ? 'SINCITY' : 'UPTOWN'}</span>
      <div className={`w-8 h-4 rounded-full relative transition-colors flex-shrink-0 ${sinMode ? 'bg-red-400' : 'bg-gray-300'}`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-200 ${sinMode ? 'left-4' : 'left-0.5'}`} />
      </div>
    </button>
  );
}
