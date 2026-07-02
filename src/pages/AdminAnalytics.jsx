import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  RefreshCw,
} from "lucide-react";
import { CSVLink } from "react-csv";
import Select from "react-select";

import { getAIAnalyticsDashboardData } from "../lib/analytics";

export default function AdminAnalytics({ language = "en" }) {
  const text = {
    en: {
      title: "AI Analytics Dashboard",
      subtitle: "Insights and trends from complaint data",
      topIssues: "Most Recurring Issues",
      deptWithHighest: "Department with Highest Complaints",
      deptWithLowest: "Department with Lowest Resolution Time",
      avgResolutionTime: "Average Resolution Time by Department",
      categoryTrend: "Complaint Category Trends",
      hourlyDistribution: "Hourly Complaint Distribution",
      predictedLoad: "Predicted Complaint Load",
      filterBy: "Filter by Period",
      last7days: "Last 7 Days",
      last30days: "Last 30 Days",
      last90days: "Last 90 Days",
      complaints: "Complaints",
      hours: "hours",
      totalComplaints: "Total Complaints",
      resolved: "Resolved",
      pending: "Pending",
      escalated: "Escalated",
      noData: "No data available",
      loading: "Loading analytics...",
      refresh: "Refresh",
      exportCsv: "Export CSV",
      actual: "Actual",
      predicted: "Predicted",
    },
    ur: {
      title: "AI Analytics Dashboard",
      subtitle: "Complaint data سے insights اور trends",
      topIssues: "سب سے زیادہ آنے والے مسائل",
      deptWithHighest: "سب سے زیادہ شکایات والا محکمہ",
      deptWithLowest: "سب سے کم حل کرنے کا وقت",
      avgResolutionTime: "محکموں کے حساب سے اوسط حل کا وقت",
      categoryTrend: "Complaint Category Trends",
      hourlyDistribution: "Hourly Complaint Distribution",
      predictedLoad: "Predicted Complaint Load",
      filterBy: "مدت کے حساب سے فلٹر",
      last7days: "آخری 7 دن",
      last30days: "آخری 30 دن",
      last90days: "آخری 90 دن",
      complaints: "شکایات",
      hours: "گھنٹے",
      totalComplaints: "کل شکایات",
      resolved: "حل شدہ",
      pending: "زیر التواء",
      escalated: "Escalated",
      noData: "کوئی ڈیٹا دستیاب نہیں",
      loading: "Analytics لوڈ ہو رہی ہیں...",
      refresh: "Refresh",
      exportCsv: "CSV Export",
      actual: "Actual",
      predicted: "Predicted",
    },
  };

  const periodOptions = [
    { value: 7, label: text[language].last7days },
    { value: 30, label: text[language].last30days },
    { value: 90, label: text[language].last90days },
  ];

  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[1]);
  const [summary, setSummary] = useState(null);
  const [recurringIssues, setRecurringIssues] = useState([]);
  const [resolutionTimeData, setResolutionTimeData] = useState([]);
  const [categoryTrendData, setCategoryTrendData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);
  const [exportDataset, setExportDataset] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const daysCount = Number(selectedPeriod?.value || 30);

  const monthsCount = useMemo(() => {
    if (daysCount <= 30) return 4;
    if (daysCount <= 90) return 6;
    return 12;
  }, [daysCount]);

  const loadAnalytics = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getAIAnalyticsDashboardData({
        daysCount,
        monthsCount,
        recurringLimit: 5,
      });

      setSummary(data.summary);
      setRecurringIssues(data.recurringIssues || []);
      setResolutionTimeData(data.resolutionTimeByDepartment || []);
      setHourlyData(data.hourlyDistribution || []);
      setCategoryTrendData(data.categoryTrends || []);
      setPredictionData(data.predictedComplaintLoad || []);
      setExportDataset(data.exportDataset || []);
    } catch (err) {
      console.error("[AdminAnalytics] load error:", err);
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysCount, monthsCount]);

  const handleFilterChange = (selectedOption) => {
    setSelectedPeriod(selectedOption);
  };

  const formatNumber = (value) => Number(value || 0).toLocaleString();

  const formatHours = (value) => {
    const num = Number(value || 0);
    return Number.isInteger(num) ? num : num.toFixed(2);
  };

  const csvHeaders = [
    { label: "Complaint ID", key: "complaint_id" },
    { label: "Title", key: "title" },
    { label: "Category", key: "category" },
    { label: "Status", key: "status" },
    { label: "Department", key: "department" },
    { label: "Created At", key: "created_at" },
    { label: "Resolved At", key: "resolved_at" },
    { label: "Resolution Hours", key: "resolution_hours" },
    { label: "Detected Issue", key: "detected_issue" },
  ];

  const renderTrendIcon = (trend) => {
    if (trend === "up") {
      return <TrendingUp className="w-4 h-4 text-red-600 shrink-0" />;
    }

    if (trend === "down") {
      return <TrendingDown className="w-4 h-4 text-green-600 shrink-0" />;
    }

    return <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {text[language].title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {text[language].subtitle}
            </p>
          </div>

          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {text[language].loading}
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {text[language].title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {text[language].subtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
            <div className="min-w-0 flex-1 sm:flex-none">
              <Select
                value={selectedPeriod}
                options={periodOptions}
                onChange={handleFilterChange}
                className="min-w-[180px] text-sm"
                classNamePrefix="react-select"
              />
            </div>

            <button
              type="button"
              onClick={() => loadAnalytics({ silent: true })}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-60"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {text[language].refresh}
            </button>

            <CSVLink
              data={exportDataset}
              headers={csvHeaders}
              filename={`ucms-ai-analytics-${daysCount}-days.csv`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white shrink-0 w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              {text[language].exportCsv}
            </CSVLink>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {text[language].totalComplaints}
              </p>
              <p className="mt-2 text-3xl font-bold">
                {formatNumber(summary?.total_complaints)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {text[language].resolved}
              </p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {formatNumber(summary?.resolved_complaints)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {text[language].pending}
              </p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">
                {formatNumber(summary?.pending_complaints)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {text[language].escalated}
              </p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {formatNumber(summary?.escalated_complaints)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{text[language].deptWithHighest}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-semibold">
                  {summary?.highest_department || "No Data"}
                </p>
                <p className="text-gray-600 dark:text-slate-400">
                  {formatNumber(summary?.highest_department_count)}{" "}
                  {text[language].complaints}
                </p>
                <div className="flex items-center gap-2 text-red-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">{selectedPeriod.label}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{text[language].deptWithLowest}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-semibold">
                  {summary?.fastest_department || "No Data"}
                </p>
                <p className="text-gray-600 dark:text-slate-400">
                  {formatHours(summary?.fastest_avg_resolution_hours)}{" "}
                  {text[language].hours}
                </p>
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm">
                    Overall avg:{" "}
                    {formatHours(summary?.overall_avg_resolution_hours)}{" "}
                    {text[language].hours}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {text[language].topIssues}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recurringIssues.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {text[language].noData}
                </p>
              ) : (
                <div className="space-y-3">
                  {recurringIssues.slice(0, 3).map((issue, index) => (
                    <div
                      key={`${issue.issue}-${index}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{issue.issue}</p>
                        <p className="text-xs text-gray-600 dark:text-slate-400">
                          {formatNumber(issue.complaint_count)}{" "}
                          {text[language].complaints}
                        </p>
                      </div>
                      {renderTrendIcon(issue.trend)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{text[language].avgResolutionTime}</CardTitle>
            </CardHeader>
            <CardContent>
              {resolutionTimeData.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  {text[language].noData}
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resolutionTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dept" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="avg_resolution_hours"
                      fill="#3b82f6"
                      name={text[language].hours}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{text[language].hourlyDistribution}</CardTitle>
            </CardHeader>
            <CardContent>
              {hourlyData.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  {text[language].noData}
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name={text[language].complaints}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{text[language].categoryTrend}</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryTrendData.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                {text[language].noData}
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={categoryTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="academic"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Academic"
                  />
                  <Line
                    type="monotone"
                    dataKey="it"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="IT"
                  />
                  <Line
                    type="monotone"
                    dataKey="transport"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Transport"
                  />
                  <Line
                    type="monotone"
                    dataKey="administrative"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Administrative"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{text[language].predictedLoad}</CardTitle>
          </CardHeader>
          <CardContent>
            {predictionData.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                {text[language].noData}
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={predictionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name={text[language].actual}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name={text[language].predicted}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
