import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { createUserAsAdmin } from "../lib/admin";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [deps, setDeps] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDeps, setLoadingDeps] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [form, setForm] = useState({
    uniqueId: "",
    password: "",
    role: "student",
    department_id: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null); // { type: "success" | "error", text: string }

  // ------------- LOAD DEPARTMENTS + USERS ON MOUNT -------------
  useEffect(() => {
    let active = true;

    async function loadDeps() {
      try {
        const { data, error } = await supabase
          .from("departments")
          .select("id, name")
          .order("name", { ascending: true });

        if (error) throw error;
        if (active) setDeps(data || []);
      } catch (e) {
        console.error("[AdminUsers] loadDeps error:", e);
      } finally {
        if (active) setLoadingDeps(false);
      }
    }

    async function loadUsers() {
      try {
        setLoadingUsers(true);

        const { data, error } = await supabase
          .from("profiles")
          .select("id, unique_id, role, department_id, created_at")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("[AdminUsers] loadUsers error:", error);
          throw error;
        }

        if (active) {
          console.log("[AdminUsers] profiles loaded:", data);
          setUsers(data || []);
        }
      } catch (e) {
        console.error("[AdminUsers] loadUsers exception:", e);
      } finally {
        if (active) setLoadingUsers(false);
      }
    }

    loadDeps();
    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  // ------------- FILTERED LIST (SEARCH + ROLE) -------------
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
      const matchesSearch =
        !q ||
        u.unique_id?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  // ------------- CREATE USER HANDLER -------------
  async function handleCreateUser(e) {
    e.preventDefault();
    setMsg(null);

    if (!form.uniqueId.trim() || form.password.length < 6) {
      setMsg({
        type: "error",
        text: "Provide a Unique ID and a password (min 6 characters).",
      });
      return;
    }

    if (!["student", "faculty", "coordinator", "admin"].includes(form.role)) {
      setMsg({ type: "error", text: "Invalid role selected." });
      return;
    }

    try {
      setSubmitting(true);

      const result = await createUserAsAdmin({
        uniqueId: form.uniqueId.trim(),
        password: form.password,
        role: form.role,
        department_id: form.department_id || null,
      });

      setMsg({
        type: "success",
        text: `✅ User created (id: ${result.user_id})`,
      });

      setForm({
        uniqueId: "",
        password: "",
        role: "student",
        department_id: "",
      });

      // 🔁 Reload users AFTER creation
      const { data, error } = await supabase
        .from("profiles")
        .select("id, unique_id, role, department_id, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[AdminUsers] reload users error:", error);
      } else {
        console.log("[AdminUsers] profiles reloaded:", data);
        setUsers(data || []);
      }
    } catch (err) {
      console.error("[AdminUsers] create user error:", err);
      setMsg({
        type: "error",
        text: err?.message || "Failed to create user.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // ------------- DELETE USER HANDLER (auth.users via RPC) -------------
  async function handleDeleteUser(userId, uniqueId) {
    const ok = window.confirm(
      `Are you sure you want to delete user "${uniqueId}"? This will remove their account from the system.`
    );
    if (!ok) return;

    setMsg(null);

    try {
      // Call Postgres function: admin_delete_user(target_user_id uuid)
      const { error } = await supabase.rpc("admin_delete_user", {
        target_user_id: userId,
      });

      if (error) {
        console.error("[AdminUsers] delete user error (RPC):", error);
        setMsg({
          type: "error",
          text: error.message || "Failed to delete user.",
        });
        return;
      }

      // Remove from local state
      setUsers((prev) => prev.filter((u) => u.id !== userId));

      setMsg({
        type: "success",
        text: `🗑️ User "${uniqueId}" deleted`,
      });
    } catch (err) {
      console.error("[AdminUsers] delete user exception:", err);
      setMsg({
        type: "error",
        text: err?.message || "Failed to delete user.",
      });
    }
  }

  // ------------- JSX -------------
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-base-light">Manage Users</h1>
          <p className="text-sm text-subtle">
            View, filter, create, and delete user accounts for UCMS.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT: Users table */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-4 text-base-light">
              <span>All Users</span>

              <div className="flex items-center gap-2">
                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-base-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty / Staff</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="admin">Admin</option>
                </select>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
                  <input
                    type="text"
                    placeholder="Search by ID or role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-7 pr-3 py-1.5 text-sm rounded-lg border border-border bg-background text-base-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-12 text-subtle gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading users…</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-10 text-center text-subtle text-sm">
                No users found for this filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/60">
                      <th className="text-left px-3 py-2 font-medium text-subtle text-xs">
                        Unique ID
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-subtle text-xs">
                        Role
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-subtle text-xs">
                        Department ID
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-subtle text-xs">
                        Created At
                      </th>
                      <th className="text-right px-3 py-2 font-medium text-subtle text-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b last:border-b-0 hover:bg-muted/40"
                      >
                        <td className="px-3 py-2 font-medium text-base-light">
                          {u.unique_id}
                        </td>
                        <td className="px-3 py-2 capitalize text-base-light">
                          {u.role || "-"}
                        </td>
                        <td className="px-3 py-2 text-xs text-subtle">
                          {u.department_id || "—"}
                        </td>
                        <td className="px-3 py-2 text-xs text-subtle">
                          {u.created_at
                            ? new Date(u.created_at).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteUser(u.id, u.unique_id)
                            }
                            className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-rose-950/60"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT: Create user form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base-light">
              <Plus className="w-4 h-4" />
              <span>Create New User</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {msg && (
              <div
                className={`mb-4 rounded-lg px-4 py-2 text-sm ${
                  msg.type === "success"
                    ? "bg-emerald-900/40 text-emerald-100 border border-emerald-700"
                    : "bg-rose-900/40 text-rose-100 border border-rose-700"
                }`}
              >
                {msg.text}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Unique ID */}
              <div>
                <label className="block text-xs font-medium text-subtle mb-1">
                  University Unique ID
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-base-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. FA22-123"
                  value={form.uniqueId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, uniqueId: e.target.value }))
                  }
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-subtle mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-base-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-medium text-subtle mb-1">
                  Role
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-base-light focus:outline-none focus:ring-2 focus:ring-primary/50"
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
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-medium text-subtle mb-1">
                  Department (optional)
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-base-light focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
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
                  <p className="text-[11px] text-subtle mt-1">
                    Loading departments…
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full rounded-lg bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{submitting ? "Creating…" : "Create User"}</span>
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}