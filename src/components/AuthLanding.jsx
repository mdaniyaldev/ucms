import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthLanding() {
  const { user, loading, authLoading } = useAuth();
  if (loading || authLoading) return null; // Provider shows splash

  // Already logged in? send to dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  // Not logged in? go to login
  return <Navigate to="/login" replace />;
}