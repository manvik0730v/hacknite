import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const tabs = [
  { path: '/quests',  label: 'Quest',   icon: '⚔️'  },
  { path: '/map',     label: 'Map',     icon: '🗺️'  },
  { path: '/home',    label: 'Home',    icon: '🏠'  },
  { path: '/friends', label: 'Friends', icon: '👥'  },
  { path: '/profile', label: 'Profile', icon: '👤'  },
];

export default function BottomNav() {
  const { sinMode } = useTheme();
  return (
    <nav className={`fixed bottom-0 left-0 right-0 flex justify-around items-center h-16 z-50 border-t
      ${sinMode ? 'bg-[#140000] border-[#3d0000]' : 'bg-white border-[#e0e0e0]'}`}>
      {tabs.map(t => (
        <NavLink key={t.path} to={t.path}
          className={({ isActive }) => `flex flex-col items-center text-xs gap-0.5 px-3 py-1 rounded-xl transition
            ${isActive
              ? sinMode ? 'text-red-400' : 'text-[#111]'
              : sinMode ? 'text-red-900' : 'text-[#aaa]'}`}>
          <span className="text-xl">{t.icon}</span>
          <span className="font-medium">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
