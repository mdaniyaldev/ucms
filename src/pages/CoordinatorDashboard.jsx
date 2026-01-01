import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDeptStats,
  listDepartmentComplaints,
} from "../lib/coordinator";

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    open_count: 0,
    in_review_count: 0,
    resolved_count: 0,
    overdue_count: 0,
    avg_resolution_hours: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, complaintsData] = await Promise.all([
          getDeptStats(),
          listDepartmentComplaints(),
        ]);
        setStats(statsData);
        setRecentComplaints(complaintsData?.slice(0, 5) || []);
      } catch (err) {
        console.error("Error fetching coordinator data:", err);
        setError("Failed to load dashboard data. " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      label: "Pending",
      value: stats.open_count,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "In Review",
      value: stats.in_review_count,
      icon: AlertTriangle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Resolved",
      value: stats.resolved_count,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Overdue",
      value: stats.overdue_count,
      icon: TrendingUp, // or other icon
      color: "text-rose-600",
      bgColor: "bg-rose-50",
    },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { label: "Pending", variant: "secondary" },
      in_review: { label: "In Review", variant: "secondary" },
      resolved: { label: "Resolved", variant: "default" },
      escalated: { label: "Escalated", variant: "destructive" },
    };
    const config = statusConfig[status] || statusConfig.open;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
            Coordinator Dashboard
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Overview of department complaints
          </p>
        </div>
        <Button onClick={() => navigate("/coordinator/complaints")}>
            View All Complaints
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-slate-400 text-sm">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

        {/* Avg Resolution Time Card? Maybe later. */}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Complaints</CardTitle>
          <Button variant="link" onClick={() => navigate("/coordinator/complaints")}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-600 dark:text-slate-400">
              Loading...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : recentComplaints.length === 0 ? (
             <div className="text-center py-8 text-gray-600 dark:text-slate-400">
              No complaints found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentComplaints.map((c) => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800"
                    onClick={() => navigate("/coordinator/complaints")} // Could go to detail view later
                  >
                    <TableCell className="text-xs">{c.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell>{c.student?.unique_id || "N/A"}</TableCell>
                    <TableCell>{formatDate(c.created_at)}</TableCell>
                    <TableCell>{getStatusBadge(c.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
