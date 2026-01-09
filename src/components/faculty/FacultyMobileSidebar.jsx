import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, LogOut, User, Send, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const menu = [
    { name: "Dashboard", icon: LayoutDashboard, to: "/faculty/dashboard" },
    { name: "My Complaints", icon: FileText, to: "/faculty/complaints" },
    { name: "Submit Complaint", icon: Send, to: "/faculty/submit-complaint" },
];

export default function FacultyMobileSidebar({ open, setOpen }) {
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
                    <h1 className="text-xl font-semibold text-indigo-800 dark:text-indigo-300">
                        UCMS Faculty
                    </h1>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-800"
                    >
                        <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>

                {/* Logged in as section */}
                <div className="flex items-center gap-2 mb-6 p-3 bg-indigo-100 dark:bg-slate-800 rounded-lg">
                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <div className="flex-1">
                        <p className="text-xs text-indigo-500 dark:text-slate-400">Logged in as</p>
                        <p className="text-sm font-semibold text-indigo-800 dark:text-slate-100 truncate">
                            {user?.unique_id || "Faculty"}
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
                                        ? "bg-indigo-600 text-white"
                                        : "text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-800"}`}
                            >
                                <Icon className="w-5 h-5" />
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
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </aside>
        </>
    );
}
