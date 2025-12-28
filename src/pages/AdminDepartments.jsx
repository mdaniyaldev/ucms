import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Loader2, Plus } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function AdminDepartments() {
  const [deps, setDeps] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(true);

  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState(null); // { type: "success" | "error", text: string }

  // LOAD DEPARTMENTS
  useEffect(() => {
    let active = true;

    async function loadDeps() {
      try {
        setLoadingDeps(true);
        const { data, error } = await supabase
          .from("departments")
          .select("id, name, created_at")
          .order("name", { ascending: true });

        if (error) throw error;
        if (active) {
          setDeps(data || []);
        }
      } catch (e) {
        console.error("[AdminDepartments] loadDeps error:", e);
        if (active) {
          setMsg({
            type: "error",
            text: "Failed to load departments.",
          });
        }
      } finally {
        if (active) setLoadingDeps(false);
      }
    }

    loadDeps();
    return () => {
      active = false;
    };
  }, []);

  // CREATE DEPARTMENT 
  async function handleCreate(e) {
    e.preventDefault();
    setMsg(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setMsg({
        type: "error",
        text: "Department name is required.",
      });
      return;
    }

    // simple duplicate check on client
    const exists = deps.some(
      (d) => d.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setMsg({
        type: "error",
        text: "A department with this name already exists.",
      });
      return;
    }

    try {
      setCreating(true);

      const { data, error } = await supabase
        .from("departments")
        .insert({ name: trimmed })
        .select("id, name, created_at")
        .single();

      if (error) throw error;

      setDeps((prev) =>
        [...prev, data].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
      setName("");
      setMsg({
        type: "success",
        text: ` Department “${data.name}” created successfully.`,
      });
    } catch (e) {
      console.error("[AdminDepartments] create error:", e);
      let text =
        e?.message || "Failed to create department. Please try again.";
      if (
        typeof e?.message === "string" &&
        e.message.toLowerCase().includes("duplicate")
      ) {
        text =
          "A department with this name already exists (database constraint).";
      }
      setMsg({ type: "error", text });
    } finally {
      setCreating(false);
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-sky-600" />
            <span>Departments</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage academic and administrative departments for UCMS.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT: Department list */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>All Departments</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDeps ? (
              <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading departments…</span>
              </div>
            ) : deps.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No departments found. Create the first department from the
                panel on the right.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        #
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {deps.map((d, index) => (
                      <tr
                        key={d.id}
                        className="border-b last:border-b-0 hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2 font-medium">
                          {d.name}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {d.created_at
                            ? new Date(d.created_at).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT: Create department */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Create Department</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {msg && (
              <div
                className={`mb-4 rounded-lg px-4 py-2 text-sm ${
                  msg.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700/70"
                    : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-700/70"
                }`}
              >
                {msg.text}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-muted-foreground">
                  Department Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Use unique, human-readable names. Duplicate names are not
                  allowed.
                </p>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="mt-2 w-full rounded-lg bg-sky-600 text-white text-sm font-semibold px-4 py-2 flex items-center justify-center gap-2 hover:bg-sky-500 disabled:opacity-60"
              >
                {creating && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>{creating ? "Creating…" : "Create Department"}</span>
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}