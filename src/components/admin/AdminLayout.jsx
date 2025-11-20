// src/components/admin/AdminLayout.jsx
import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileSidebar from "./MobileSidebar";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Block access if not admin
  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar open={mobileOpen} setOpen={setMobileOpen} />

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar setMobileOpen={setMobileOpen} />

        {/* Page content */}
        <main className="flex-1 p-6 bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}