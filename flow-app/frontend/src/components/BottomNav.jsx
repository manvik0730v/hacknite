import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const tabs = [
  { path: '/quests', label: 'Quest', icon: '⚔️' },
  { path: '/map',    label: 'Map',   icon: '🗺️' },
  { path: '/home',   label: 'Home',  icon: '🏠' },
  { path: '/friends',label: 'Friends',icon: '👥' },
  { path: '/profile',label: 'Profile',icon: '👤' },
];

export default function BottomNav() {
  const { sinMode } = useTheme();
  return (
    <nav className={`fixed bottom-0 left-0 right-0 flex justify-around items-center h-16 z-50
      ${sinMode ? 'bg-black border-t border-cyan-900' : 'bg-white border-t border-gray-200'}`}>
      {tabs.map(t => (
        <NavLink key={t.path} to={t.path}
          className={({ isActive }) => `flex flex-col items-center text-xs gap-0.5
            ${isActive ? (sinMode ? 'text-cyan-400' : 'text-indigo-600') : 'text-gray-400'}`}>
          <span className="text-xl">{t.icon}</span>
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}