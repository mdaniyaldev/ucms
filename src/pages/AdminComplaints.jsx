import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Eye, Filter, Loader2 } from "lucide-react";
import { CSVLink } from "react-csv";
import Progress from "../components/ui/Progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);  // Removed TypeScript type annotation
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);  // Removed TypeScript type annotation

  // Static complaints data
  const staticComplaints = [
    {
      id: "C001",
      title: "Lab equipment not working",
      description: "Computers in Lab 3 are not functioning properly",
      status: "pending",
      category: "academic",
      created_at: "2025-10-12T10:00:00Z",
      assigned_to: "coordinator1",
      student_id: "S001",
      progress: 0,
      hasEvidence: true,
    },
    {
      id: "C002",
      title: "Wi-Fi connectivity issues",
      description: "Frequent disconnections in hostel area",
      status: "in-progress",
      category: "it",
      created_at: "2025-10-10T12:00:00Z",
      assigned_to: "coordinator2",
      student_id: "S002",
      progress: 50,
      hasEvidence: false,
    },
    {
      id: "C003",
      title: "Bus schedule delay",
      description: "Bus arriving 30 minutes late daily",
      status: "resolved",
      category: "transport",
      created_at: "2025-10-08T11:30:00Z",
      assigned_to: "coordinator1",
      student_id: "S003",
      progress: 100,
      hasEvidence: true,
    },
    {
      id: "C004",
      title: "Library book shortage",
      description: "Required textbooks not available",
      status: "escalated",
      category: "administrative",
      created_at: "2025-10-05T09:00:00Z",
      assigned_to: "coordinator2",
      student_id: "S004",
      progress: 25,
      hasEvidence: false,
    },
    {
      id: "C005",
      title: "Exam schedule conflict",
      description: "Two exams scheduled at same time",
      status: "in-progress",
      category: "academic",
      created_at: "2025-10-14T14:30:00Z",
      assigned_to: "coordinator1",
      student_id: "S005",
      progress: 75,
      hasEvidence: true,
    },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setComplaints(staticComplaints);
      setLoading(false);
    }, 1000); // Simulating data load
  }, []);

  const filteredComplaints = useMemo(() => {
    if (filter === "all") return complaints;
    return complaints.filter((c) => c.status === filter);
  }, [complaints, filter]);

  const handleStatusChange = async (id, newStatus) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  const handleAssign = async (id, coordinator) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, assigned_to: coordinator } : c))
    );
  };

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

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="badge badge-pending">Pending</span>;
      case "in-progress":
        return <span className="badge badge-in-progress">In Progress</span>;
      case "resolved":
        return <span className="badge badge-resolved">Resolved</span>;
      case "escalated":
        return <span className="badge badge-escalated">Escalated</span>;
      default:
        return <span className="badge badge-default">Unknown</span>;
    }
  };

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
              <option value="escalated">Escalated</option>
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
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => (
                  <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-blue-600">{complaint.id}</span>
                            <div className="text-gray-600">
                              <strong>{complaint.category}</strong>
                              <span className="ml-1">|</span>
                              <span>{complaint.assigned_to}</span>
                            </div>
                          </div>
                          <h3 className="text-gray-900 mb-1">{complaint.title}</h3>
                          <p className="text-gray-600 text-sm">{complaint.description}</p>
                          <p className="text-gray-500 text-xs mt-2">
                            Date: {new Date(complaint.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(complaint.status)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-gray-900">{complaint.progress}%</span>
                        </div>
                        <Progress value={complaint.progress} />
                      </div>

                      {(complaint.status !== "resolved" && complaint.status !== "escalated") && (
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleStatusChange(complaint.id, "in-progress")}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                          >
                            Set In Progress
                          </button>
                          <button
                            onClick={() => handleStatusChange(complaint.id, "escalated")}
                            className="bg-red-500 text-white px-4 py-2 rounded"
                          >
                            Escalate
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
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