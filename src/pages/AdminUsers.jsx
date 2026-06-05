// AdminUsers.jsx

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, Plus, Trash2, Users, UserCheck, AlertCircle, Building2, Mail } from "lucide-react";
import { supabase } from "../lib/supabase";
import { createUserAsAdmin } from "../lib/admin";

// Converts  03001234567  →  +923001234567
// Converts  923001234567 →  +923001234567
// Leaves    +923001234567 unchanged
function normalizePhone(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("92")) return `+${digits}`;
  if (digits.startsWith("0")) return `+92${digits.slice(1)}`;
  return `+${digits}`;
}

export default function AdminUsers() {
  // TAB STATE
  const [activeTab, setActiveTab] = useState("users"); // "users" or "departments"

  // USERS TAB STATE
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [form, setForm] = useState({
    uniqueId: "",
    password: "",
    email: "",
    phone: "", // NEW: Phone field
    role: "student",
  });

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  // DEPARTMENTS TAB STATE
  const [coordinators, setCoordinators] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingCoordinators, setLoadingCoordinators] = useState(true);
  const [deptMsg, setDeptMsg] = useState(null);

  // LOAD USERS ON MOUNT
  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoadingUsers(true);

      const { data, error } = await supabase
        .from("profiles")
        // Added 'phone' to the select query to ensure it renders in the table
        .select("id, unique_id, role, email, email_verified, phone, department_id, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[AdminUsers] loadUsers error:", error);
        throw error;
      }

      console.log("[AdminUsers] profiles loaded:", data);
      setUsers(data || []);
    } catch (e) {
      console.error("[AdminUsers] loadUsers exception:", e);
    } finally {
      setLoadingUsers(false);
    }
  }

  // LOAD COORDINATORS & DEPARTMENTS (for Departments tab)
  useEffect(() => {
    if (activeTab === "departments") {
      fetchCoordinatorsAndDepartments();
    }
  }, [activeTab]);

  async function fetchCoordinatorsAndDepartments() {
    try {
      setLoadingCoordinators(true);
      setDeptMsg(null);

      // Fetch all coordinators with their department info
      const { data: coordData, error: coordError } = await supabase
        .from("profiles")
        .select(`
          id,
          unique_id,
          role,
          department_id,
          departments (
            id,
            name
          )
        `)
        .eq("role", "coordinator")
        .order("created_at", { ascending: false });

      if (coordError) throw coordError;

      // Fetch all departments
      const { data: deptData, error: deptError } = await supabase
        .from("departments")
        .select("id, name")
        .order("name", { ascending: true });

      if (deptError) throw deptError;

      setCoordinators(coordData || []);
      setDepartments(deptData || []);
    } catch (error) {
      console.error("[AdminUsers] fetchCoordinatorsAndDepartments error:", error);
      setDeptMsg({
        type: "error",
        text: "Failed to load data: " + error.message,
      });
    } finally {
      setLoadingCoordinators(false);
    }
  }

  // FILTERED USERS LIST (SEARCH + ROLE)
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
      const matchesSearch =
        !q ||
        u.unique_id?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q); // Added phone to search scope
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  // CREATE USER HANDLER 
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

    // Validate email if provided
    if (form.email && !form.email.includes('@')) {
      setMsg({
        type: "error",
        text: "Please provide a valid email address.",
      });
      return;
    }

    if (!["student", "faculty", "coordinator", "admin"].includes(form.role)) {
      setMsg({ type: "error", text: "Invalid role selected." });
      return;
    }

    try {
      setSubmitting(true);

      // Create user (existing function)
      const result = await createUserAsAdmin({
        uniqueId: form.uniqueId.trim(),
        password: form.password,
        role: form.role,
        department_id: null, // Always null during signup
      });

      // Update profile with email if provided
      if (form.email) {
        const { error: emailError } = await supabase
          .from('profiles')
          .update({
            email: form.email.trim(),
            email_verified: true // Auto-verify for admin-created users
          })
          .eq('id', result.user_id);

        if (emailError) {
          console.warn('[AdminUsers] Failed to set email:', emailError);
          // Don't throw - user is created, just email not set
        }
      }

      // Update profile with phone if provided
      if (form.phone) {
        const normalized = normalizePhone(form.phone.trim());
        const { error: phoneError } = await supabase
          .from("profiles")
          .update({
            phone: normalized,
            phone_verified: true, // admin-created → auto-verify
            notify_sms: true,
          })
          .eq("id", result.user_id);

        if (phoneError) {
          console.warn("[AdminUsers] Failed to set phone:", phoneError);
        }
      }

      setMsg({
        type: "success",
        text: `User created successfully! ${form.email || form.phone ? 'Notifications enabled.' : ''}`,
      });

      setForm({ 
        uniqueId: "", 
        password: "", 
        email: "", 
        phone: "", 
        role: "student" 
      });

      // Reload users
      await loadUsers();
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

  // DELETE USER HANDLER 
  async function handleDeleteUser(userId, uniqueId) {
    const ok = window.confirm(
      `Are you sure you want to delete user "${uniqueId}"? This will remove their account from the system.`
    );
    if (!ok) return;

    setMsg(null);

    try {
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

      setUsers((prev) => prev.filter((u) => u.id !== userId));

      setMsg({
        type: "success",
        text: `User "${uniqueId}" deleted`,
      });
    } catch (err) {
      console.error("[AdminUsers] delete user exception:", err);
      setMsg({
        type: "error",
        text: err?.message || "Failed to delete user.",
      });
    }
  }

  // ASSIGN DEPARTMENT HANDLER 
  async function handleAssignDepartment(coordinatorId, coordinatorName, departmentId) {
    if (!departmentId) {
      setDeptMsg({ type: "error", text: "Please select a department" });
      return;
    }

    setDeptMsg(null);

    try {
      // Check if department is already assigned
      const { data: existingAssignment, error: checkError } = await supabase
        .from("profiles")
        .select("id, unique_id")
        .eq("department_id", departmentId)
        .eq("role", "coordinator")
        .neq("id", coordinatorId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingAssignment) {
        setDeptMsg({
          type: "error",
          text: `This department is already assigned to ${existingAssignment.unique_id}`,
        });
        return;
      }

      // Assign department
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ department_id: departmentId })
        .eq("id", coordinatorId);

      if (updateError) throw updateError;

      setDeptMsg({
        type: "success",
        text: `Department assigned to ${coordinatorName} successfully!`,
      });

      // Refresh coordinators
      fetchCoordinatorsAndDepartments();
    } catch (error) {
      console.error("[AdminUsers] assign error:", error);
      setDeptMsg({
        type: "error",
        text: "Failed to assign department: " + error.message,
      });
    }
  }

  // GET AVAILABLE DEPARTMENTS
  function getAvailableDepartments() {
    const assignedDeptIds = coordinators
      .filter((c) => c.department_id)
      .map((c) => c.department_id);

    return departments.filter((d) => !assignedDeptIds.includes(d.id));
  }

  // JSX     
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-base-light">User Management</h1>
          <p className="text-sm text-subtle">
            Manage user accounts and assign departments to coordinators.
          </p>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
              activeTab === "users"
                ? "border-primary text-primary"
                : "border-transparent text-subtle hover:text-base-light"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </button>

          <button
            onClick={() => setActiveTab("departments")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
              activeTab === "departments"
                ? "border-primary text-primary"
                : "border-transparent text-subtle hover:text-base-light"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Assign Departments</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "users" && (
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
                      placeholder="Search by ID, email, phone..."
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
                          Email
                        </th>
                        <th className="text-left px-3 py-2 font-medium text-subtle text-xs">
                          Phone
                        </th>
                        <th className="text-left px-3 py-2 font-medium text-subtle text-xs">
                          Role
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
                          <td className="px-3 py-2 text-sm">
                            {u.email ? (
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-emerald-400" />
                                <span className="text-base-light">{u.email}</span>
                                {u.email_verified && (
                                  <span className="text-emerald-400 text-xs">✓</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-rose-400 text-xs">No email</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {u.phone ? (
                              <span className="text-base-light font-mono text-xs">{u.phone}</span>
                            ) : (
                              <span className="text-subtle text-xs">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 capitalize text-base-light">
                            {u.role || "-"}
                          </td>
                          <td className="px-3 py-2 text-xs text-subtle">
                            {u.created_at
                              ? new Date(u.created_at).toLocaleString()
                              : "—"}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.unique_id)}
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

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-subtle mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
                    <input
                      type="email"
                      className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-base-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="user@example.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                    />
                  </div>
                  <p className="text-xs text-subtle mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    User will receive email notifications if provided
                  </p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-medium text-subtle mb-1">
                    WhatsApp Number (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-subtle font-mono">
                      +92
                    </span>
                    <input
                      type="tel"
                      className="w-full rounded-lg border border-border bg-background pl-10 pr-3 py-2 text-sm text-base-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="3001234567"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <p className="text-xs text-subtle mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    User must join Twilio sandbox to receive WhatsApp messages
                  </p>
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
      )}

      {activeTab === "departments" && (
        <div className="space-y-6">
          {deptMsg && (
            <div
              className={`rounded-lg px-4 py-3 text-sm flex items-start gap-2 ${
                deptMsg.type === "success"
                  ? "bg-emerald-900/40 text-emerald-100 border border-emerald-700"
                  : "bg-rose-900/40 text-rose-100 border border-rose-700"
              }`}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{deptMsg.text}</span>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base-light">
                <Building2 className="w-5 h-5" />
                <span>Coordinator - Department Mapping</span>
              </CardTitle>
              <p className="text-sm text-subtle mt-1">
                Each department can only be assigned to one coordinator (one-time assignment).
              </p>
            </CardHeader>

            <CardContent>
              {loadingCoordinators ? (
                <div className="flex items-center justify-center py-12 text-subtle gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading coordinators…</span>
                </div>
              ) : coordinators.length === 0 ? (
                <div className="py-10 text-center text-subtle text-sm">
                  No coordinators found. Create coordinator accounts first in the "Manage Users" tab.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/60">
                        <th className="text-left px-4 py-3 font-medium text-subtle text-xs">
                          Coordinator ID
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-subtle text-xs">
                          Assigned Department
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-subtle text-xs">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {coordinators.map((coordinator) => (
                        <tr
                          key={coordinator.id}
                          className="border-b last:border-b-0 hover:bg-muted/40"
                        >
                          <td className="px-4 py-3 font-medium text-base-light">
                            {coordinator.unique_id}
                          </td>

                          <td className="px-4 py-3">
                            {coordinator.department_id ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/40 text-emerald-100 text-xs font-medium border border-emerald-700">
                                <UserCheck className="w-3 h-3" />
                                {coordinator.departments?.name || "Unknown Department"}
                              </span>
                            ) : (
                              <span className="text-rose-400 text-xs font-medium">
                                Not Assigned
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {coordinator.department_id ? (
                              <span className="text-xs text-subtle italic">
                                Already assigned
                              </span>
                            ) : (
                              <select
                                onChange={(e) =>
                                  handleAssignDepartment(
                                    coordinator.id,
                                    coordinator.unique_id,
                                    e.target.value
                                  )
                                }
                                defaultValue=""
                                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-base-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                              >
                                <option value="" disabled>
                                  Select Department
                                </option>
                                {getAvailableDepartments().map((dept) => (
                                  <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-base-light">
                    {coordinators.length}
                  </p>
                  <p className="text-xs text-subtle mt-1">Total Coordinators</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">
                    {coordinators.filter((c) => c.department_id).length}
                  </p>
                  <p className="text-xs text-subtle mt-1">Assigned</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-rose-400">
                    {coordinators.filter((c) => !c.department_id).length}
                  </p>
                  <p className="text-xs text-subtle mt-1">Unassigned</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}