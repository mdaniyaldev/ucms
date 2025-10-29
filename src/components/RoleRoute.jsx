import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ allow = [] }) {
  const { user, loading, authLoading } = useAuth();

  if (loading || authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allow.length && !allow.includes(user.role))
    return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
