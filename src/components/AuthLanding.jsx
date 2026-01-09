import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthLanding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user?.role === "admin") navigate("/admin", { replace: true });
    else if (user?.role === "coordinator") navigate("/coordinator/dashboard", { replace: true });
    else if (user?.role === "faculty") navigate("/faculty/dashboard", { replace: true });
    else if (user?.role === "student") navigate("/student-dashboard", { replace: true });
    else if (user) navigate("/dashboard", { replace: true });
    else navigate("/login", { replace: true });
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen grid place-items-center bg-slate-950">
      <div className="text-slate-300">Loading…</div>
    </div>
  );
}