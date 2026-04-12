import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'auto');

  const sinMode = theme === 'sincity';

  const getEffectiveTheme = () => {
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
    }
    return theme;
  };

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const effective = getEffectiveTheme();
    document.body.className = '';
    document.body.classList.add(`theme-${effective}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, sinMode, getEffectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
