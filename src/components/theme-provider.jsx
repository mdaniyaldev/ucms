// src/components/theme-provider.jsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext(null);
const THEME_KEY = "ucms-theme";

// <html> pe class add/remove
function applyThemeClass(theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(null); // null = not loaded yet

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);

      if (stored === "light" || stored === "dark") {
        // agar pehle se koi theme save hai to wahi use karo
        setThemeState(stored);
        applyThemeClass(stored);
      } else {
        // pehli dafa → ALWAYS light
        const initial = "light";
        setThemeState(initial);
        applyThemeClass(initial);
        localStorage.setItem(THEME_KEY, initial);
      }
    } catch (e) {
      console.warn("Theme load error:", e);
      setThemeState("light");
      applyThemeClass("light");
    }
  }, []);

  function setTheme(next) {
    setThemeState(next);
    applyThemeClass(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  }

  // Jab tak theme load nahi hoti, blank screen with correct bg
  if (theme === null) {
    return <div className="min-h-screen bg-white dark:bg-slate-900" />;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}