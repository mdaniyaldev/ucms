import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FileText, Building, Settings, LogOut, LucideBanknoteArrowUp, MessageSquareText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const menu = [
  { name: "Overview", icon: LayoutDashboard, to: "/admin" },
  { name: "Manage Users", icon: Users, to: "/admin/users" },
  // { name: "Departments", icon: Building, to: "/admin/departments" },
  { name: "Complaints", icon: FileText, to: "/admin/complaints" },
  // { name: "Settings", icon: Settings, to: "/admin/settings" },
  { name: "Analytics", icon: LucideBanknoteArrowUp, to: "/admin/analytics" },
  { name: "Feedback", icon: MessageSquareText, to: "/admin/feedback" },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="hidden md:block w-64 bg-white dark:bg-slate-950 border-r border-slate-300 dark:border-slate-800 p-4">
      <h1 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-100">UCMS Admin</h1>

      <nav className="space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition font-medium
                ${active
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"}`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}

        <button
          onClick={logout}
          className="flex items-center gap-3 mt-4 px-4 py-2 w-full rounded-lg text-sm text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/20"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </nav>
    </aside>
  );
}