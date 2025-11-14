import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // If an admin somehow lands here, push them to /admin
  useEffect(() => {
    if (user?.role === "admin") navigate("/admin", { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
        <h1 className="text-xl font-semibold">UCMS — Dashboard</h1>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-300">
            Signed in as <b>{user?.name || user?.unique_id}</b>
          </span>

          {/* Admin quick access */}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-semibold hover:bg-sky-500"
            >
              Admin
            </Link>
          )}

          <button
            onClick={logout}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold hover:bg-rose-500"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold mb-2">
            Welcome, {user?.name || user?.unique_id}!
          </h2>

          <p className="text-slate-300">
            This is a protected page. Only authenticated users can view it.
          </p>

          <ul className="mt-4 list-disc space-y-1 pl-6 text-slate-300">
            <li>Create complaint form (title, category, description)</li>
            <li>List complaints table (status: Open / In-Review / Resolved)</li>
            <li>Role-based views (Student / Faculty / Coordinator / Admin)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}