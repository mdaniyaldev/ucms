import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "../lib/supabase";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { FileDown, Eye, Filter, Loader2 } from "lucide-react";
import { CSVLink } from "react-csv";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    async function loadComplaints() {
      setLoading(true);
      const { data, error } = await supabase
        .from("complaints")
        .select("id, title, description, status, category, created_at, assigned_to, student_id");
      if (!error) setComplaints(data || []);
      setLoading(false);
    }
    loadComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    if (filter === "all") return complaints;
    return complaints.filter((c) => c.status === filter);
  }, [complaints, filter]);

  const handleStatusChange = async (id, newStatus) => {
    await supabase.from("complaints").update({ status: newStatus }).eq("id", id);
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  const handleAssign = async (id, coordinator) => {
    await supabase.from("complaints").update({ assigned_to: coordinator }).eq("id", id);
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, assigned_to: coordinator } : c))
    );
  };

  // Static analytics data for now
  const analyticsData = [
    { status: "Open", count: complaints.filter((c) => c.status === "open").length },
    { status: "In Progress", count: complaints.filter((c) => c.status === "in-progress").length },
    { status: "Resolved", count: complaints.filter((c) => c.status === "resolved").length },
  ];

  const csvHeaders = [
    { label: "Complaint ID", key: "id" },
    { label: "Title", key: "title" },
    { label: "Description", key: "description" },
    { label: "Status", key: "status" },
    { label: "Category", key: "category" },
    { label: "Assigned To", key: "assigned_to" },
    { label: "Student ID", key: "student_id" },
    { label: "Created At", key: "created_at" },
  ];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Complaints Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View, filter, and manage student complaints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-md text-sm px-3 py-1.5 dark:bg-slate-900 dark:border-slate-700"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <CSVLink
            data={complaints}
            headers={csvHeaders}
            filename="complaints_report.csv"
            className="flex items-center gap-2 px-3 py-1.5 border rounded-md text-sm bg-white hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700"
          >
            <FileDown className="w-4 h-4" />
            Export CSV
          </CSVLink>
        </div>
      </div>

      {/* Analytics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Complaint Statistics</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading complaints…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Assigned To</th>
                    <th className="text-left p-2">Created At</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="p-2 font-medium">{c.title}</td>
                      <td className="p-2">{c.category}</td>
                      <td className="p-2 capitalize">
                        <select
                          value={c.status}
                          onChange={(e) =>
                            handleStatusChange(c.id, e.target.value)
                          }
                          className="border rounded-md text-xs px-2 py-1 dark:bg-slate-900 dark:border-slate-700"
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          value={c.assigned_to || ""}
                          onChange={(e) =>
                            handleAssign(c.id, e.target.value)
                          }
                          className="border rounded-md text-xs px-2 py-1 dark:bg-slate-900 dark:border-slate-700"
                        >
                          <option value="">Unassigned</option>
                          <option value="coordinator1">Coordinator 1</option>
                          <option value="coordinator2">Coordinator 2</option>
                        </select>
                      </td>
                      <td className="p-2 text-xs text-slate-500">
                        {new Date(c.created_at).toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <Eye className="w-4 h-4" />
                          View
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

      {/* Complaint detail modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg w-[500px] max-w-[90%] p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-2">{selectedComplaint.title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              {selectedComplaint.description}
            </p>
            <div className="text-sm space-y-1 mb-4">
              <p><strong>Status:</strong> {selectedComplaint.status}</p>
              <p><strong>Category:</strong> {selectedComplaint.category}</p>
              <p><strong>Assigned To:</strong> {selectedComplaint.assigned_to || "None"}</p>
              <p><strong>Student ID:</strong> {selectedComplaint.student_id}</p>
              <p><strong>Created At:</strong> {new Date(selectedComplaint.created_at).toLocaleString()}</p>
            </div>
            <button
              onClick={() => setSelectedComplaint(null)}
              className="mt-4 w-full rounded-md bg-blue-600 text-white py-2 hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}