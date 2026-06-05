import { X, LayoutDashboard, Users, FileText, Building, Settings, LogOut, MessageSquareText, Lightbulb, BarChart3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logoIcon from "../../assets/logo1_icon_transparent.png";

export default function MobileSidebar({ open, setOpen }) {
  const { logout } = useAuth();
  const location = useLocation();

  const menu = [
    { name: "Overview", icon: LayoutDashboard, to: "/admin" },
    { name: "Manage Users", icon: Users, to: "/admin/users" },
    { name: "Departments", icon: Building, to: "/admin/departments" },
    { name: "Complaints", icon: FileText, to: "/admin/complaints" },
    { name: "Settings", icon: Settings, to: "/admin/settings" },
    { name: "Feedback", icon: MessageSquareText, to: "/admin/feedback" },
    { name: "Suggestions", icon: Lightbulb, to: "/admin/suggestions" },
    { name: "Polls", icon: BarChart3, to: "/admin/polls" },
  ];

  return (
    <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition 
        ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>

      <div className={`absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-950 p-4 border-r border-slate-300 dark:border-slate-800 transition
          ${open ? "translate-x-0" : "-translate-x-full"}`}>

        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col items-center justify-center px-3 pt-3 pb-2 bg-transparent">
            <img
              src={logoIcon}
              alt="University Complaint Management System Logo"
              className="w-12 h-12 object-contain bg-transparent"
            />
            <div className="mt-1.5 text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-300">
              ADMIN
            </div>
          </div>
          <button onClick={() => setOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="space-y-1">
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
      </div>
    </div>
  );
}