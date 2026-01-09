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
    Briefcase,
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
import { listMyComplaints, subscribeToMyComplaints } from "../lib/faculty";

export function FacultyDashboard() {
    const navigate = useNavigate();
    const [language, setLanguage] = useState("en");
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const text = {
        en: {
            welcome: "Faculty Portal",
            subtitle: "Report and track departmental issues",
            overview: "Issues Overview",
            pending: "Pending",
            inReview: "In Review",
            resolved: "Resolved",
            escalated: "Escalated",
            submitNew: "Report New Issue",
            recentComplaints: "Recent Issues",
            title: "Title",
            category: "Category",
            department: "Department",
            date: "Date",
            status: "Status",
            viewAll: "View All Issues",
            academic: "Academic",
            it: "IT Services",
            transport: "Transport",
            administrative: "Administrative",
            noIssues: "No issues reported yet.",
            submitFirst: "Submit your first issue!",
        },
        ur: {
            welcome: "فیکلٹی پورٹل",
            subtitle: "محکمانہ مسائل کی رپورٹ اور ٹریکنگ",
            overview: "مسائل کا جائزہ",
            pending: "زیر التواء",
            inReview: "جائزے میں",
            resolved: "حل ہو گیا",
            escalated: "آگے بھیجا گیا",
            submitNew: "نیا مسئلہ رپورٹ کریں",
            recentComplaints: "حالیہ مسائل",
            title: "عنوان",
            category: "قسم",
            department: "محکمہ",
            date: "تاریخ",
            status: "حیثیت",
            viewAll: "تمام مسائل دیکھیں",
            academic: "تعلیمی",
            it: "آئی ٹی سروسز",
            transport: "نقل و حمل",
            administrative: "انتظامی",
            noIssues: "ابھی تک کوئی مسئلہ رپورٹ نہیں ہوا۔",
            submitFirst: "اپنا پہلا مسئلہ جمع کرائیں!",
        },
    };

    // Fetch complaints on component mount
    useEffect(() => {
        let unsubscribe;

        const fetchComplaints = async () => {
            setLoading(true);
            try {
                const data = await listMyComplaints();
                setComplaints(data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchComplaints();

        (async () => {
            unsubscribe = await subscribeToMyComplaints(() => {
                fetchComplaints(); // refresh on updates
            });
        })();

        return () => unsubscribe?.();
    }, []);

    // Calculate stats from real data
    const stats = [
        {
            label: text[language].pending,
            value: complaints.filter((c) => c.status === "open").length,
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        },
        {
            label: text[language].inReview,
            value: complaints.filter((c) => c.status === "in_review").length,
            icon: AlertTriangle,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
        },
        {
            label: text[language].resolved,
            value: complaints.filter((c) => c.status === "resolved").length,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-900/20",
        },
        {
            label: text[language].escalated,
            value: complaints.filter((c) => c.status === "escalated").length,
            icon: FileText,
            color: "text-red-600",
            bgColor: "bg-red-50 dark:bg-red-900/20",
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
                label: text[language].pending,
                variant: "secondary",
            },
            in_review: {
                label: text[language].inReview,
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
        };

        const config = statusConfig[status] || statusConfig.open;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB");
    };

    // Show recent complaints - last 5
    const recentComplaints = complaints.slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                            {text[language].welcome}
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-slate-400">
                        {text[language].subtitle}
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
                        onClick={() => navigate("/faculty/submit-complaint")}
                        className="gap-2 bg-indigo-600 hover:bg-indigo-700"
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
                            <Card key={index} className="border-indigo-100 dark:border-slate-700">
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

            <Card className="border-indigo-100 dark:border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{text[language].recentComplaints}</CardTitle>
                    <Button
                        variant="link"
                        className="text-indigo-600 dark:text-indigo-400"
                        onClick={() => navigate("/faculty/complaints")}
                    >
                        {text[language].viewAll}
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-gray-600 dark:text-slate-400">
                            Loading issues...
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-600 dark:text-red-400">
                            Error: {error}
                        </div>
                    ) : complaints.length === 0 ? (
                        <div className="text-center py-8 text-gray-600 dark:text-slate-400">
                            {text[language].noIssues}{" "}
                            {text[language].submitFirst}
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
                                        className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-800"
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
