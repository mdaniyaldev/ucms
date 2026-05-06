import { useState, useEffect } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
  Loader2,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import {
  getAdminStats,
  getDepartmentAnalytics,
  getCategoryDistribution,
  getTrendData,
} from "../lib/admin";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [period, setPeriod] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for all data
  const [stats, setStats] = useState({
    total: 0,
    pending_count: 0,
    in_review_count: 0,
    resolved_count: 0,
    escalated_count: 0,
    avg_resolution_hours: 0,
  });
  const [departmentData, setDepartmentData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError(null);

      // Determine days based on period
      const days = period === "week" ? 7 : period === "month" ? 30 : 365;

      // Fetch all data in parallel
      const [statsData, deptAnalytics, categoryDist, trends] = await Promise.all([
        getAdminStats(),
        getDepartmentAnalytics(),
        getCategoryDistribution(),
        getTrendData(days),
      ]);

      setStats(statsData);
      setPerformanceData(deptAnalytics);
      
      // Department data for bar chart (complaints count)
      setDepartmentData(
        deptAnalytics.map((d) => ({
          name: d.name,
          complaints: d.total,
        }))
      );

      setCategoryData(categoryDist);
      setTrendData(trends);
    } catch (err) {
      console.error("[AdminDashboard] fetch error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  // Top summary tiles
  const statCards = [
    {
      label: "Total Complaints",
      value: stats.total,
      icon: FileText,
      chip: "bg-blue-100 text-blue-600",
    },
    {
      label: "Pending",
      value: stats.pending_count,
      icon: Clock,
      chip: "bg-amber-100 text-amber-600",
    },
    {
      label: "In Progress",
      value: stats.in_review_count,
      icon: AlertTriangle,
      chip: "bg-orange-100 text-orange-600",
    },
    {
      label: "Resolved",
      value: stats.resolved_count,
      icon: CheckCircle2,
      chip: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Escalated",
      value: stats.escalated_count,
      icon: TrendingUp,
      chip: "bg-rose-100 text-rose-600",
    },
    {
      label: "Avg. Resolution Time",
      value: stats.avg_resolution_hours ? (stats.avg_resolution_hours / 24).toFixed(1) : "0",
      suffix: "days",
      icon: Users,
      chip: "bg-violet-100 text-violet-600",
    },
  ];

  const categoryColors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96 gap-2 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <p className="text-rose-600 font-medium">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor complaints and department performance.
          </p>
        </div>

        {/* Period filter */}
        <div>
          <label className="mr-2 text-sm text-slate-500 dark:text-slate-400">
            Filter by period:
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="border-slate-200/80 dark:border-slate-800/80 shadow-sm"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold">
                      {stat.value}
                    </span>
                    {stat.suffix && (
                      <span className="text-xs text-slate-500">
                        {stat.suffix}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${stat.chip}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Complaints by Department (Bar) */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Complaints by Department
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="complaints" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                No department data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complaints by Category (Pie) */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Complaints by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                    label={({ name }) => name}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={categoryColors[index % categoryColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resolution Trend */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Resolution Trend (Last {period === "week" ? "7" : period === "month" ? "30" : "365"} Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Resolved"
                  />
                  <Line
                    type="monotone"
                    dataKey="submitted"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Submitted"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department Performance table */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Department Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {performanceData.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <th className="py-2 pr-3 text-left font-medium">Department</th>
                    <th className="py-2 px-3 text-left font-medium">Total</th>
                    <th className="py-2 px-3 text-left font-medium">Resolved</th>
                    <th className="py-2 px-3 text-left font-medium">
                      Avg. Time
                    </th>
                    <th className="py-2 px-3 text-left font-medium">
                      Success Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.map((row) => {
                    const success = Math.round(
                      (row.resolved / row.total) * 100
                    );
                    return (
                      <tr
                        key={row.name}
                        className="border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                      >
                        <td className="py-2 pr-3 text-slate-800 dark:text-slate-100">
                          {row.name}
                        </td>
                        <td className="py-2 px-3">{row.total}</td>
                        <td className="py-2 px-3">{row.resolved}</td>
                        <td className="py-2 px-3">{row.avgTime} days</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                              <div
                                className="h-2 rounded-full bg-emerald-500"
                                style={{ width: `${success}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-300">
                              {success}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                No performance data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}