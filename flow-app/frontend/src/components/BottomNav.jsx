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
      ${sinMode ? 'bg-[#140000] border-[#3d0000]' : 'bg-white border-[#e0e0e0]'}`}>
      {tabs.map(({ path, label, Icon }) => (
        <NavLink key={path} to={path}
          className={({ isActive }) => `flex flex-col items-center text-xs gap-0.5 px-3 py-1 rounded-xl transition
            ${isActive
              ? sinMode ? 'text-red-400' : 'text-[#111]'
              : sinMode ? 'text-red-900' : 'text-[#bbb]'}`}>
          <Icon size={22} />
          <span className="font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
