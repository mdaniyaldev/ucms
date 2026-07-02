import { Sun, Moon, Menu, Bell } from "lucide-react";
import { useTheme } from "../theme-provider";
import { useNotifications } from "../../context/NotificationContext";
import NotificationPanel from "./NotificationPanel";
import { useState } from "react";

export default function StudentNavbar({ setMobileOpen }) {
  const { theme, setTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const [notificationOpen, setNotificationOpen] = useState(false);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <>
      <nav
        className="
          w-full h-16 px-6
          flex items-center justify-between
          bg-white dark:bg-slate-900
          border-b border-slate-200 dark:border-slate-800
        "
      >
        {/* Left: mobile menu + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>
          <h1 className="font-semibold text-base sm:text-lg text-slate-800 dark:text-slate-100 truncate">
            Student Dashboard
          </h1>
        </div>

        {/* Right: notifications + theme toggle */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="
              relative inline-flex items-center justify-center
              rounded-full p-2
              bg-slate-100 dark:bg-slate-800
              text-slate-700 dark:text-slate-100
              hover:bg-slate-200 dark:hover:bg-slate-700
              transition
            "
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

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

      {/* Notification Panel */}
      <NotificationPanel
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </>
  );
}
