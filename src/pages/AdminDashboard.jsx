import { useState } from "react";
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

export default function AdminDashboard() {
  const [period, setPeriod] = useState("week");

  // Top summary tiles
  const stats = [
    {
      label: "Total Complaints",
      value: 124,
      icon: FileText,
      chip: "bg-blue-100 text-blue-600",
    },
    {
      label: "Pending",
      value: 23,
      icon: Clock,
      chip: "bg-amber-100 text-amber-600",
    },
    {
      label: "In Progress",
      value: 35,
      icon: AlertTriangle,
      chip: "bg-orange-100 text-orange-600",
    },
    {
      label: "Resolved",
      value: 58,
      icon: CheckCircle2,
      chip: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Escalated",
      value: 8,
      icon: TrendingUp,
      chip: "bg-rose-100 text-rose-600",
    },
    {
      label: "Avg. Resolution Time",
      value: "4.2",
      suffix: "days",
      icon: Users,
      chip: "bg-violet-100 text-violet-600",
    },
  ];

  // Fake analytics data (static for now)
  const departmentData = [
    { name: "IT", complaints: 45 },
    { name: "Academic", complaints: 31 },
    { name: "Transport", complaints: 27 },
    { name: "Library", complaints: 15 },
    { name: "Admin", complaints: 6 },
  ];

  const categoryData = [
    { name: "Academic", value: 32 },
    { name: "IT Services", value: 45 },
    { name: "Transport", value: 25 },
    { name: "Administrative", value: 22 },
  ];

  const categoryColors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

  const trendData = [
    { day: "Mon", resolved: 8, submitted: 12 },
    { day: "Tue", resolved: 12, submitted: 10 },
    { day: "Wed", resolved: 10, submitted: 15 },
    { day: "Thu", resolved: 15, submitted: 8 },
    { day: "Fri", resolved: 9, submitted: 11 },
    { day: "Sat", resolved: 6, submitted: 7 },
    { day: "Sun", resolved: 4, submitted: 5 },
  ];

  const performanceData = [
    { dept: "IT Department", total: 45, resolved: 32, avgTime: 3.5 },
    { dept: "Academic", total: 32, resolved: 28, avgTime: 4.1 },
    { dept: "Transport", total: 25, resolved: 20, avgTime: 5.2 },
    { dept: "Library", total: 15, resolved: 12, avgTime: 3.8 },
  ];

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
        {stats.map((stat) => {
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="complaints" radius={[6, 6, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
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
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resolution Trend */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Resolution Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
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
                      key={row.dept}
                      className="border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                    >
                      <td className="py-2 pr-3 text-slate-800 dark:text-slate-100">
                        {row.dept}
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
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}