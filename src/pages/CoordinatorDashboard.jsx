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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
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
  // We use this state to hold ALL complaints for charting
  const [allComplaints, setAllComplaints] = useState([]);
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
        setAllComplaints(complaintsData || []);
      } catch (err) {
        console.error("Error fetching coordinator data:", err);
        setError("Failed to load dashboard data. " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- CHART DATA PROCESSING ---

  // 1. Status Distribution
  const statusData = [
    { name: "Pending", value: parseInt(stats.open_count || 0), color: "#f59e0b" },
    { name: "In Review", value: parseInt(stats.in_review_count || 0), color: "#3b82f6" },
    { name: "Resolved", value: parseInt(stats.resolved_count || 0), color: "#22c55e" },
  ].filter((d) => d.value > 0);

  // 2. Category Distribution
  // Group by category string
  const categoryCounts = allComplaints.reduce((acc, c) => {
    const cat = c.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.keys(categoryCounts).map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1), // Capitalize
    value: categoryCounts[cat],
  }));

  // 3. Weekly Trends
  // Group by date (last 7 days)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]); // YYYY-MM-DD
    }
    return days;
  };
  const last7Days = getLast7Days();

  const trendData = last7Days.map((dateStr) => {
    // Count complaints created on this date
    const count = allComplaints.filter((c) =>
      c.created_at?.startsWith(dateStr)
    ).length;
    // Format date for display (e.g. "Mon 12")
    const displayDate = new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
    return {
      date: displayDate,
      complaints: count,
    };
  });


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

  // Recent complaints slice
  const recentComplaints = allComplaints.slice(0, 5);

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

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="complaints" stroke="#3b82f6" fillOpacity={1} fill="url(#colorComplaints)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full flex items-center justify-center">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-400 text-sm">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Bar Chart */}
      {/* <Card>
            <CardHeader>
                <CardTitle>Complaints by Category</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical" margin={{ left: 40 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center text-gray-400 text-sm pt-8">No category data available</div>
                    )}
                </div>
            </CardContent>
        </Card> */}

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
                  <TableHead>Submitter</TableHead>
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
                    <TableCell className="text-xs">
                      {c.student?.role === 'faculty' ? 'Faculty: ' : 'Student: '}
                      {c.student?.unique_id || "N/A"}
                    </TableCell>
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
