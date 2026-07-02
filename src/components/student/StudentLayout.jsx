import { useState } from "react";
import StudentSidebar from "./StudentSidebar";
import StudentNavbar from "./StudentNavbar";
import StudentMobileSidebar from "./StudentMobileSidebar";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function StudentLayout({ children }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Block access if not student
  if (user?.role !== "student") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      {/* Desktop Sidebar */}
      <StudentSidebar />

      {/* Mobile Sidebar */}
      <StudentMobileSidebar open={mobileOpen} setOpen={setMobileOpen} />

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <StudentNavbar setMobileOpen={setMobileOpen} />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}