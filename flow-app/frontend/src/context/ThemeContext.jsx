import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [sinMode, setSinMode] = useState(() => localStorage.getItem('sinMode') === 'true');

  useEffect(() => {
    localStorage.setItem('sinMode', sinMode);
    document.body.className = sinMode ? 'theme-sincity' : 'theme-uptown';
  }, [sinMode]);

  return (
    <ThemeContext.Provider value={{ sinMode, setSinMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
