import { Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "../theme-provider";
// import { useNotifications } from "../../context/NotificationContext"; // Re-enable if we want notification bell for coordinators
// import NotificationPanel from "../student/NotificationPanel"; // May need a separate one or reuse

export default function CoordinatorNavbar({ setMobileOpen }) {
  const { theme, setTheme } = useTheme();
  // const { unreadCount } = useNotifications();

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <nav
      className="
        w-full h-16 px-6
        flex items-center justify-between
        bg-white dark:bg-slate-900
        border-b border-slate-200 dark:border-slate-800
      "
    >
      {/* Left: mobile menu + title */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>
        <h1 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
          Coordinator Portal
        </h1>
      </div>

      {/* Right: theme toggle */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="
            inline-flex items-center justify-center
            rounded-full p-2
            bg-slate-100 dark:bg-slate-800
            text-slate-700 dark:text-slate-100
            hover:bg-slate-200 dark:hover:bg-slate-700
            transition
          "
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-yellow-300" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>
    </nav>
  );
}
