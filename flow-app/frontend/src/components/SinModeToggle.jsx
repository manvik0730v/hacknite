import { useTheme } from '../context/ThemeContext';

export default function SinModeToggle() {
  const { sinMode, setSinMode } = useTheme();
  return (
    <button
      onClick={() => setSinMode(!sinMode)}
      style={{ minWidth: '130px' }}
      className={`btn-lift flex items-center justify-between gap-2 px-3 py-1.5 rounded-full text-xs font-bold border
        ${sinMode
          ? 'bg-gradient-to-r from-red-900 to-red-700 border-red-700 text-white'
          : 'bg-white border-blue-200 text-blue-800'}`}>
      <span className="w-16 text-center">{sinMode ? 'SINCITY' : 'UPTOWN'}</span>
      <div className={`w-8 h-4 rounded-full relative flex-shrink-0 transition-colors ${sinMode ? 'bg-red-400' : 'bg-blue-300'}`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-200 ${sinMode ? 'left-4' : 'left-0.5'}`} />
      </div>
    </button>
  );
}
