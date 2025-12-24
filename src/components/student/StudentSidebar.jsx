import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, LogOut, User, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const menu = [
  { name: "Dashboard", icon: LayoutDashboard, to: "/student-dashboard" },
  { name: "My Complaints", icon: FileText, to: "/student/complaints" },
  { name: "Submit Complaint", icon: Send, to: "/student/submit-complaint" },
];

export default function StudentSidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <aside className="hidden md:block w-64 bg-white dark:bg-slate-950 border-r border-slate-300 dark:border-slate-800 p-4 flex flex-col">
      <div>
        <h1 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-100">UCMS Student</h1>
        
        {/* Logged in as section */}
        <div className="flex items-center gap-2 mb-6 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <div className="flex-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Logged in as</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {user?.unique_id || "Student"}
            </p>
          </div>
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
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sm text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </aside>
  );
}