import { useState } from "react";
import CoordinatorSidebar from "./CoordinatorSidebar";
import CoordinatorNavbar from "./CoordinatorNavbar";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function CoordinatorLayout({ children }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Block access if not coordinator
  if (user?.role !== "coordinator") {
    // Redirect to login or unauthorized page if needed
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      {/* Desktop Sidebar */}
      <CoordinatorSidebar />

      {/* Mobile Sidebar - simplified for now, can add proper mobile overlay later if needed */}
      {/* For now, we will trust the main layout or just hide sidebar on mobile */}
      
      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <CoordinatorNavbar setMobileOpen={setMobileOpen} />

        {/* Page content */}
        <main className="flex-1 p-6 bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
