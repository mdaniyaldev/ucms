import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createUserAsAdmin } from "../lib/admin";
import { supabase } from "../lib/supabase";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [deps, setDeps] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(true);
  const [form, setForm] = useState({
    uniqueId: "",
    password: "",
    role: "student",
    department_id: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("departments")
          .select("id, name")
          .order("name", { ascending: true });
        if (error) throw error;
        if (active) setDeps(data || []);
      } catch (e) {
        console.error("Load departments error:", e);
      } finally {
        if (active) setLoadingDeps(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);

    if (!form.uniqueId.trim() || form.password.length < 6) {
      setMsg({
        type: "error",
        text: "Provide a Unique ID and a password (min 6 chars).",
      });
      return;
    }

    if (!["student", "faculty", "coordinator", "admin"].includes(form.role)) {
      setMsg({ type: "error", text: "Invalid role selected." });
      return;
    }

    const dep = form.department_id || null;

    setSubmitting(true);
    try {
      const result = await createUserAsAdmin({
        uniqueId: form.uniqueId.trim(),
        password: form.password,
        role: form.role,
        department_id: dep,
      });
      setMsg({
        type: "success",
        text: `✅ User created successfully (id: ${result.user_id})`,
      });
      setForm({ uniqueId: "", password: "", role: "student", department_id: "" });
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Failed to create user" });
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-6 py-4">
          <p className="text-red-400 font-medium">Forbidden — Admins only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
        <h1 className="text-xl font-semibold">UCMS — Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-semibold hover:bg-sky-500"
          >
            Back to Dashboard
          </a>
          <button
            onClick={logout}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold hover:bg-rose-500"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="p-6 grid gap-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 max-w-xl">
          <h2 className="text-lg font-semibold mb-4">Create New User</h2>

          {msg && (
            <div
              className={`mb-4 rounded-lg px-4 py-2 text-sm ${
                msg.type === "success"
                  ? "bg-emerald-900/40 text-emerald-200 border border-emerald-700"
                  : "bg-rose-900/40 text-rose-200 border border-rose-700"
              }`}
            >
              {msg.text}
            </div>
          )}

          <form onSubmit={onSubmit} className="grid gap-4">
            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">
                University Unique ID
              </span>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-700/40"
                placeholder="e.g., FA22-123"
                value={form.uniqueId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, uniqueId: e.target.value }))
                }
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">
                Initial Password
              </span>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-700/40"
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">Role</span>
              <select
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-slate-500"
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty / Staff</option>
                <option value="coordinator">Department Coordinator</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">
                Department (optional)
              </span>
              <select
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-slate-500 disabled:opacity-60"
                value={form.department_id}
                disabled={loadingDeps}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department_id: e.target.value }))
                }
              >
                <option value="">— none —</option>
                {deps.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {loadingDeps && (
                <span className="text-xs text-slate-400">
                  Loading departments…
                </span>
              )}
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create user"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}