import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [sinMode, setSinMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('sin-mode', sinMode);
  }, [sinMode]);

  return (
    <ThemeContext.Provider value={{ sinMode, setSinMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);