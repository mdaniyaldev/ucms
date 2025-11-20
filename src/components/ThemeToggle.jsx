import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export default function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const handleClick = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-full border " +
        "border-slate-200 dark:border-slate-700 " +
        "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 " +
        "shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition " +
        className
      }
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
