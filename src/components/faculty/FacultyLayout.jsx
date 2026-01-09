import { useState } from "react";
import FacultySidebar from "./FacultySidebar";
import FacultyNavbar from "./FacultyNavbar";
import FacultyMobileSidebar from "./FacultyMobileSidebar";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function FacultyLayout({ children }) {
    const { user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Block access if not faculty
    if (user?.role !== "faculty") {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="flex min-h-screen bg-indigo-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
            {/* Desktop Sidebar */}
            <FacultySidebar />

            {/* Mobile Sidebar */}
            <FacultyMobileSidebar open={mobileOpen} setOpen={setMobileOpen} />

            {/* Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Navbar */}
                <FacultyNavbar setMobileOpen={setMobileOpen} />

                {/* Page content */}
                <main className="flex-1 p-6 bg-slate-50 dark:bg-slate-950">
                    {children}
                </main>
            </div>
        </div>
    );
}
