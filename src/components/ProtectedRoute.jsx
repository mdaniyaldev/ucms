import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading, authLoading } = useAuth();
  if (loading || authLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950">
        <div className="text-slate-300">Checking session…</div>
      </div>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}