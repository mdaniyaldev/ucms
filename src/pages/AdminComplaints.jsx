import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileDown,
  Filter,
  Loader2,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Eye,
  Calendar,
  User,
  Building2,
} from "lucide-react";
import { CSVLink } from "react-csv";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getAllComplaints, updateComplaintStatus } from "../lib/admin";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null); // ID of complaint being updated

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected complaint for detail view
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, searchQuery]);

  async function fetchComplaints() {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        status: statusFilter,
        category: categoryFilter,
        search: searchQuery,
      };

      const data = await getAllComplaints(filters);
      setComplaints(data);
    } catch (err) {
      console.error("[AdminComplaints] fetch error:", err);
      setError(err.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      setUpdating(id);
      await updateComplaintStatus(id, newStatus);
      
      // Update local state
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.error("[AdminComplaints] status update error:", err);
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdating(null);
    }
  }

  // Analytics data for chart
  const analyticsData = useMemo(() => {
    const statusCounts = {
      Open: complaints.filter((c) => c.status === "open").length,
      "In Review": complaints.filter((c) => c.status === "in_review").length,
      Resolved: complaints.filter((c) => c.status === "resolved").length,
      Escalated: complaints.filter((c) => c.status === "escalated").length,
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  }, [complaints]);

  const csvHeaders = [
    { label: "Complaint ID", key: "id" },
    { label: "Title", key: "title" },
    { label: "Description", key: "body" },
    { label: "Status", key: "status" },
    { label: "Category", key: "category" },
    { label: "Student ID", key: "student.unique_id" },
    { label: "Department", key: "department.name" },
    { label: "Created At", key: "created_at" },
  ];

  const getStatusBadge = (status) => {
    const config = {
      open: { label: "Open", variant: "secondary", icon: Clock, color: "text-amber-600" },
      in_review: { label: "In Review", variant: "default", icon: AlertCircle, color: "text-blue-600" },
      resolved: { label: "Resolved", variant: "default", icon: CheckCircle2, color: "text-green-600" },
      escalated: { label: "Escalated", variant: "destructive", icon: TrendingUp, color: "text-rose-600" },
    };

    const statusConfig = config[status] || config.open;
    const Icon = statusConfig.icon;

    return (
      <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  const getCategoryBadge = (category) => {
    const colors = {
      academic: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      it: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      transport: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      administrative: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[category] || "bg-gray-100 text-gray-700"}`}>
        {category?.charAt(0).toUpperCase() + category?.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Complaints Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              View, filter, and manage student complaints system-wide.
            </p>
          </div>

          <CSVLink
            data={complaints}
            headers={csvHeaders}
            filename={`complaints_report_${new Date().toISOString().split('T')[0]}.csv`}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Export CSV
          </CSVLink>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 border rounded-lg text-sm px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_review">In Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border rounded-lg text-sm px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="academic">Academic</option>
                  <option value="it">IT Services</option>
                  <option value="transport">Transport</option>
                  <option value="administrative">Administrative</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Complaint Statistics</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Complaints" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Complaints List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>All Complaints ({complaints.length})</span>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="flex flex-col items-center justify-center py-12 text-rose-500 gap-3">
                <AlertCircle className="w-12 h-12" />
                <p className="font-medium">{error}</p>
                <Button onClick={fetchComplaints} variant="outline" size="sm">
                  Retry
                </Button>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12 text-slate-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading complaints…
              </div>
            ) : complaints.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No complaints found matching your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <Card key={complaint.id} className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start gap-4">
                        {/* Left: Complaint Info */}
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                                  #{complaint.id.slice(0, 8)}
                                </span>
                                {getStatusBadge(complaint.status)}
                                {getCategoryBadge(complaint.category)}
                              </div>
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {complaint.title}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                {complaint.body}
                              </p>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{complaint.student?.unique_id || "Unknown"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              <span>{complaint.department?.name || "Unassigned"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(complaint.created_at)}</span>
                            </div>
                          </div>

                          {/* Actions - Admin can only resolve complaints */}
                          {complaint.status !== "resolved" && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={() => handleStatusChange(complaint.id, "resolved")}
                                disabled={updating === complaint.id}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {updating === complaint.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Mark Resolved"
                                )}
                              </Button>
                              <Button
                                onClick={() => setSelectedComplaint(complaint)}
                                size="sm"
                                variant="ghost"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View Details
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Complaint Details</span>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500">ID</label>
                <p className="font-mono text-sm">{selectedComplaint.id}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Title</label>
                <p className="font-semibold">{selectedComplaint.title}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Description</label>
                <p className="text-sm text-slate-700 dark:text-slate-300">{selectedComplaint.body}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedComplaint.status)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Category</label>
                  <div className="mt-1">{getCategoryBadge(selectedComplaint.category)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500">Student</label>
                  <p className="text-sm">{selectedComplaint.student?.unique_id || "Unknown"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Department</label>
                  <p className="text-sm">{selectedComplaint.department?.name || "Unassigned"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500">Created At</label>
                  <p className="text-sm">{formatDate(selectedComplaint.created_at)}</p>
                </div>
                {selectedComplaint.resolved_at && (
                  <div>
                    <label className="text-xs font-medium text-slate-500">Resolved At</label>
                    <p className="text-sm">{formatDate(selectedComplaint.resolved_at)}</p>
                  </div>
                )}
              </div>
              <div className="pt-4 flex gap-2">
                <Button onClick={() => setSelectedComplaint(null)} variant="outline" className="flex-1">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}