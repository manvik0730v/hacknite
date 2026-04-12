import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { GiSwordman } from 'react-icons/gi';
import { FiMap, FiHome, FiUsers, FiUser } from 'react-icons/fi';

const tabs = [
  { path: '/quests',  label: 'Quest',   Icon: GiSwordman },
  { path: '/map',     label: 'Map',     Icon: FiMap      },
  { path: '/home',    label: 'Home',    Icon: FiHome     },
  { path: '/friends', label: 'Friends', Icon: FiUsers    },
  { path: '/profile', label: 'Profile', Icon: FiUser     },
];

export default function BottomNav() {
  const { sinMode } = useTheme();
  return (
    <nav className={`fixed bottom-0 left-0 right-0 flex justify-around items-center h-16 z-50 border-t
      ${sinMode
        ? 'border-red-900 bg-gradient-to-r from-[#0a0000] to-[#1a0000]'
        : 'border-blue-100 bg-white'}`}
      style={{ boxShadow: sinMode ? '0 -4px 20px rgba(200,0,0,0.15)' : '0 -4px 20px rgba(26,86,219,0.08)' }}>
      {tabs.map(({ path, label, Icon }) => (
        <NavLink key={path} to={path}
          className={({ isActive }) => `flex flex-col items-center text-xs gap-0.5 px-3 py-1 rounded-xl transition-all
            ${isActive
              ? sinMode ? 'text-red-400' : 'text-blue-600'
              : sinMode ? 'text-red-900' : 'text-blue-300'}`}>
          <Icon size={22} />
          <span className="font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
