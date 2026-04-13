import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [sinMode, setSinModeState] = useState(false);
  const [uid, setUid] = useState(null);

  // Load theme for current user when auth changes
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (user) {
        setUid(user.uid);
        const saved = localStorage.getItem(`theme_${user.uid}`);
        // Default is always uptown (false) for new users
        setSinModeState(saved === 'sincity');
      } else {
        setUid(null);
        setSinModeState(false); // Reset to uptown on logout
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    document.body.className = sinMode ? 'theme-sincity' : 'theme-uptown';
  }, [sinMode]);

  const setSinMode = (val) => {
    setSinModeState(val);
    if (uid) {
      localStorage.setItem(`theme_${uid}`, val ? 'sincity' : 'uptown');
    }
  };

  return (
    <ThemeContext.Provider value={{ sinMode, setSinMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
