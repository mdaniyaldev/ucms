import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, LogOut, User, MessageSquareText, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logoIcon from "../../assets/logo1_icon_transparent.png";

const menu = [
  { name: "Dashboard", icon: LayoutDashboard, to: "/coordinator/dashboard" },
  { name: "Department Complaints", icon: FileText, to: "/coordinator/complaints" },
  { name: "Feedback", icon: MessageSquareText, to: "/coordinator/feedback" },
];

export default function CoordinatorMobileSidebar({ open, setOpen }) {
  const location = useLocation();
  const { logout, user } = useAuth();

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-950 z-50 p-4 flex flex-col md:hidden shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col items-center justify-center px-3 pt-3 pb-2 bg-transparent">
            <img
              src={logoIcon}
              alt="University Complaint Management System Logo"
              className="w-12 h-12 object-contain bg-transparent"
            />
            <div className="mt-1.5 text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-300">
              STAFF
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Logged in as section */}
        <div className="flex items-center gap-2 mb-6 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg min-w-0">
          <User className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">Coordinator</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {user?.unique_id || "Coordinator"}
            </p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition font-medium
                  ${active
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => {
            setOpen(false);
            logout();
          }}
          className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sm text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Logout
        </button>
      </aside>
    </>
  );
}
