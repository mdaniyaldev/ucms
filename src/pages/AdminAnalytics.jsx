import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../components/admin/AdminLayout"; // Ensure AdminLayout includes Sidebar, Navbar
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { CSVLink } from "react-csv";
import Select from "react-select";

export default function AdminAnalytics({ language = "en" }) {
  const text = {
    en: {
      title: 'AI Analytics Dashboard',
      subtitle: 'Insights and trends from complaint data',
      topIssues: 'Most Recurring Issues',
      deptWithHighest: 'Department with Highest Complaints',
      deptWithLowest: 'Department with Lowest Resolution Time',
      avgResolutionTime: 'Average Resolution Time by Department',
      categoryTrend: 'Complaint Category Trends',
      hourlyDistribution: 'Hourly Complaint Distribution',
      predictedLoad: 'Predicted Complaint Load',
      filterBy: 'Filter by Period',
      last7days: 'Last 7 Days',
      last30days: 'Last 30 Days',
      last90days: 'Last 90 Days',
      complaints: 'Complaints',
      hours: 'hours',
    },
  };

  const recurringIssues = [
    { issue: 'Wi-Fi connectivity', count: 45, trend: 'up' },
    { issue: 'Lab equipment', count: 32, trend: 'down' },
    { issue: 'Bus delays', count: 28, trend: 'up' },
    { issue: 'Library books', count: 15, trend: 'stable' },
  ];

  const resolutionTimeData = [
    { dept: 'IT', time: 3.5 },
    { dept: 'Library', time: 3.8 },
    { dept: 'Academic', time: 4.1 },
    { dept: 'Transport', time: 5.2 },
    { dept: 'Admin', time: 6.1 },
  ];

  const categoryTrendData = [
    { month: 'Jul', academic: 25, it: 35, transport: 20, administrative: 15 },
    { month: 'Aug', academic: 30, it: 40, transport: 22, administrative: 18 },
    { month: 'Sep', academic: 28, it: 38, transport: 25, administrative: 16 },
    { month: 'Oct', academic: 32, it: 45, transport: 25, administrative: 22 },
  ];

  const hourlyData = [
    { hour: '8AM', count: 5 },
    { hour: '9AM', count: 12 },
    { hour: '10AM', count: 18 },
    { hour: '11AM', count: 22 },
    { hour: '12PM', count: 25 },
    { hour: '1PM', count: 15 },
    { hour: '2PM', count: 20 },
    { hour: '3PM', count: 24 },
    { hour: '4PM', count: 18 },
    { hour: '5PM', count: 10 },
  ];

  const predictionData = [
    { day: 'Mon', actual: 25, predicted: 28 },
    { day: 'Tue', actual: 30, predicted: 29 },
    { day: 'Wed', actual: 28, predicted: 27 },
    { day: 'Thu', actual: 32, predicted: 31 },
    { day: 'Fri', actual: 35, predicted: 33 },
    { day: 'Sat', predicted: 30 },
    { day: 'Sun', predicted: 25 },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  const handleFilterChange = (selectedOption) => {
    console.log(selectedOption);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{text[language].title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{text[language].subtitle}</p>
          </div>
          <Select
            defaultValue={{ value: '30', label: text[language].last30days }}
            options={[
              { value: '7', label: text[language].last7days },
              { value: '30', label: text[language].last30days },
              { value: '90', label: text[language].last90days },
            ]}
            onChange={handleFilterChange}
          />
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{text[language].deptWithHighest}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl">IT Department</p>
                <p className="text-gray-600">45 {text[language].complaints}</p>
                <div className="flex items-center gap-2 text-red-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+15% {text[language].last30days}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Analytics Cards */}
          <Card>
            <CardHeader>
              <CardTitle>{text[language].deptWithLowest}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl">IT Department</p>
                <p className="text-gray-600">3.5 {text[language].hours}</p>
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm">-12% {text[language].last30days}</span>
                </div>
              </div>
            </CardContent>
          </Card>

           {/* "Most Recurring Issues" Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{text[language].topIssues}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recurringIssues.slice(0, 2).map((issue, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm">{issue.issue}</p>
                      <p className="text-xs text-gray-600">{issue.count} {text[language].complaints}</p>
                    </div>
                    {issue.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-red-600" />
                    ) : issue.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                ))}
              </div>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resolutionTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dept" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="time" fill="#3b82f6" name={text[language].hours} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{text[language].hourlyDistribution}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} name={text[language].complaints} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics Section */}
        <Card>
          <CardHeader>
            <CardTitle>{text[language].categoryTrend}</CardTitle>
          </CardHeader>
          <CardContent>
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
                  name={text[language].academic}
                />
                <Line
                  type="monotone"
                  dataKey="it"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name={text[language].it}
                />
                <Line
                  type="monotone"
                  dataKey="transport"
                  stroke="#10b981"
                  strokeWidth={2}
                  name={text[language].transport}
                />
                <Line
                  type="monotone"
                  dataKey="administrative"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name={text[language].administrative}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{text[language].predictedLoad}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={predictionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name={language === 'en' ? 'Actual' : 'حقیقی'} />
                <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name={language === 'en' ? 'Predicted' : 'متوقع'} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}