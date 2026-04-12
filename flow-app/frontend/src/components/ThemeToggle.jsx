import { useTheme } from '../context/ThemeContext';

const modes = [
  { key: 'day',      label: '☀️ Day' },
  { key: 'night',    label: '🌙 Night' },
  { key: 'auto',     label: '⚡ Auto' },
  { key: 'sincity',  label: '🔴 SinCity' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex rounded-xl overflow-hidden border border-[var(--border)]">
      {modes.map(m => (
        <button
          key={m.key}
          onClick={() => setTheme(m.key)}
          className={`px-3 py-1.5 text-xs font-bold transition-all
            ${theme === m.key
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--bg2)] text-[var(--text2)] hover:bg-[var(--bg3)]'
            }`}>
          {m.label}
        </button>
      ))}
    </div>
  );
}
