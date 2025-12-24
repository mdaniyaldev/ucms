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
  Send,
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
import { listMyComplaints } from "../lib/student";

export function StudentDashboard() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const text = {
    en: {
      welcome: "Welcome back",
      overview: "Complaints Overview",
      pending: "Pending",
      inProgress: "In Progress",
      resolved: "Resolved",
      escalated: "Escalated",
      submitNew: "Submit New Complaint",
      recentComplaints: "Recent Complaints",
      title: "Title",
      category: "Category",
      department: "Department",
      date: "Date",
      status: "Status",
      viewAll: "View All Complaints",
      academic: "Academic",
      it: "IT Services",
      transport: "Transport",
      administrative: "Administrative",
      open: "Open",
      closed: "Closed",
    },
    ur: {
      welcome: "خوش آمدید",
      overview: "شکایات کا جائزہ",
      pending: "زیر التواء",
      inProgress: "جاری ہے",
      resolved: "حل ہو گیا",
      escalated: "آگے بھیجا گیا",
      submitNew: "نئی شکایت جمع کرائیں",
      recentComplaints: "حالیہ شکایات",
      title: "عنوان",
      category: "قسم",
      department: "محکمہ",
      date: "تاریخ",
      status: "حیثیت",
      viewAll: "تمام شکایات دیکھیں",
      academic: "تعلیمی",
      it: "آئی ٹی سروسز",
      transport: "نقل و حمل",
      administrative: "انتظامی",
      open: "کھلی",
      closed: "بند",
    },
  };

  // Fetch complaints on component mount
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listMyComplaints();
        setComplaints(data || []);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // Calculate stats from real data
  const stats = [
    {
      label: text[language].open,
      value: complaints.filter((c) => c.status === "open").length,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: text[language].pending,
      value: complaints.filter((c) => c.status === "pending").length,
      icon: AlertTriangle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: text[language].resolved,
      value: complaints.filter((c) => c.status === "resolved").length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: text[language].escalated,
      value: complaints.filter((c) => c.status === "escalated").length,
      icon: FileText,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const getCategoryLabel = (category) => {
    const categoryMap = {
      academic: text[language].academic,
      it: text[language].it,
      transport: text[language].transport,
      administrative: text[language].administrative,
    };
    return categoryMap[category] || category;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: {
        label: text[language].open,
        variant: "secondary",
      },
      pending: {
        label: text[language].pending,
        variant: "secondary",
      },
      resolved: {
        label: text[language].resolved,
        variant: "default",
      },
      escalated: {
        label: text[language].escalated,
        variant: "destructive",
      },
      closed: {
        label: text[language].closed,
        variant: "default",
      },
    };

    const config = statusConfig[status] || statusConfig.open;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  // Show recent complaints (last 5)
  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
            {text[language].welcome}
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            {language === "en"
              ? "Track and manage your complaints"
              : "اپنی شکایات کو ٹریک اور منظم کریں"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setLanguage(language === "en" ? "ur" : "en")}
            variant="outline"
          >
            {language === "en" ? "اردو" : "English"}
          </Button>
          <Button
            onClick={() => navigate("/student/submit-complaint")}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {text[language].submitNew}
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
          {text[language].overview}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
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
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{text[language].recentComplaints}</CardTitle>
          <Button variant="link">{text[language].viewAll}</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-600 dark:text-slate-400">
              Loading complaints...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600 dark:text-red-400">
              Error: {error}
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-slate-400">
              No complaints yet.{" "}
              {language === "en"
                ? "Submit your first complaint!"
                : "اپنی پہلی شکایت جمع کرائیں!"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{text[language].title}</TableHead>
                  <TableHead>{text[language].category}</TableHead>
                  <TableHead>{text[language].department}</TableHead>
                  <TableHead>{text[language].date}</TableHead>
                  <TableHead>{text[language].status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentComplaints.map((complaint) => (
                  <TableRow
                    key={complaint.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    <TableCell className="text-xs">
                      {complaint.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{complaint.title}</TableCell>
                    <TableCell>
                      {getCategoryLabel(complaint.category)}
                    </TableCell>
                    <TableCell>{complaint.department?.name || "N/A"}</TableCell>
                    <TableCell>{formatDate(complaint.created_at)}</TableCell>
                    <TableCell>{getStatusBadge(complaint.status)}</TableCell>
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
