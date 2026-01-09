import {
    Card,
    CardContent,
    CardHeader,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import Progress from "../components/ui/Progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import {
    BookOpen,
    Laptop,
    Bus,
    Building2,
    Search,
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listMyComplaints, subscribeToMyComplaints } from "../lib/faculty";

export function FacultyComplaints() {
    const navigate = useNavigate();
    const [language, setLanguage] = useState("en");
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const text = {
        en: {
            title: "My Issues",
            subtitle: "Track the status of all reported issues",
            search: "Search issues...",
            filterStatus: "Filter by Status",
            filterCategory: "Filter by Category",
            all: "All",
            pending: "Pending",
            inReview: "In Review",
            resolved: "Resolved",
            escalated: "Escalated",
            academic: "Academic",
            it: "IT Services",
            transport: "Transport",
            administrative: "Administrative",
            complaintId: "Issue ID",
            date: "Date",
            category: "Category",
            department: "Department",
            status: "Status",
            progress: "Progress",
            noComplaints: "No issues found",
            description: "Description",
        },
        ur: {
            title: "میرے مسائل",
            subtitle: "تمام رپورٹ شدہ مسائل کی حیثیت کو ٹریک کریں",
            search: "...مسائل تلاش کریں",
            filterStatus: "حیثیت کے مطابق فلٹر کریں",
            filterCategory: "قسم کے مطابق فلٹر کریں",
            all: "تمام",
            pending: "زیر التواء",
            inReview: "جائزے میں",
            resolved: "حل ہو گیا",
            escalated: "آگے بھیجا گیا",
            academic: "تعلیمی",
            it: "آئی ٹی سروسز",
            transport: "نقل و حمل",
            administrative: "انتظامی",
            complaintId: "مسئلہ آئی ڈی",
            date: "تاریخ",
            category: "قسم",
            department: "محکمہ",
            status: "حیثیت",
            progress: "پیش رفت",
            noComplaints: "کوئی مسئلہ نہیں ملا",
            description: "تفصیل",
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

    const getStatusIcon = (status) => {
        switch (status) {
            case "open":
                return <Clock className="w-4 h-4" />;
            case "in_review":
                return <AlertTriangle className="w-4 h-4" />;
            case "resolved":
                return <CheckCircle className="w-4 h-4" />;
            case "escalated":
                return <TrendingUp className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            open: { label: text[language].pending, variant: "secondary" },
            in_review: { label: text[language].inReview, variant: "secondary" },
            resolved: { label: text[language].resolved, variant: "default" },
            escalated: { label: text[language].escalated, variant: "destructive" },
        };

        const config = statusConfig[status] || statusConfig.open;
        return (
            <Badge variant={config.variant} className="gap-1">
                {getStatusIcon(status)}
                {config.label}
            </Badge>
        );
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case "academic":
                return <BookOpen className="w-4 h-4" />;
            case "it":
                return <Laptop className="w-4 h-4" />;
            case "transport":
                return <Bus className="w-4 h-4" />;
            case "administrative":
                return <Building2 className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getCategoryLabel = (category) => {
        const categoryMap = {
            academic: text[language].academic,
            it: text[language].it,
            transport: text[language].transport,
            administrative: text[language].administrative,
        };
        return categoryMap[category] || category;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB");
    };

    const getProgressPercentage = (status) => {
        switch (status) {
            case "open":
                return 0;
            case "in_review":
                return 50;
            case "resolved":
                return 100;
            case "escalated":
                return 25;
            default:
                return 0;
        }
    };

    const filteredComplaints = complaints.filter((complaint) => {
        // Handle status filtering
        let statusMatch = true;
        if (filterStatus !== "all") {
            statusMatch = complaint.status === filterStatus;
        }

        if (!statusMatch) return false;
        if (filterCategory !== "all" && complaint.category !== filterCategory)
            return false;
        if (
            searchQuery &&
            !complaint.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
            return false;
        }
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                        {text[language].title}
                    </h1>
                    <p className="text-gray-600 dark:text-slate-400">
                        {text[language].subtitle}
                    </p>
                </div>
                <Button
                    onClick={() => setLanguage(language === "en" ? "ur" : "en")}
                    variant="outline"
                >
                    {language === "en" ? "اردو" : "English"}
                </Button>
            </div>

            <Card className="border-indigo-100 dark:border-slate-700">
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder={text[language].search}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 pl-10 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder={text[language].filterStatus} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{text[language].all}</SelectItem>
                                <SelectItem value="open">{text[language].pending}</SelectItem>
                                <SelectItem value="in_review">
                                    {text[language].inReview}
                                </SelectItem>
                                <SelectItem value="resolved">
                                    {text[language].resolved}
                                </SelectItem>
                                <SelectItem value="escalated">
                                    {text[language].escalated}
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Category Filter */}
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder={text[language].filterCategory} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{text[language].all}</SelectItem>
                                <SelectItem value="academic">
                                    {text[language].academic}
                                </SelectItem>
                                <SelectItem value="it">{text[language].it}</SelectItem>
                                <SelectItem value="transport">
                                    {text[language].transport}
                                </SelectItem>
                                <SelectItem value="administrative">
                                    {text[language].administrative}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {loading ? (
                        <div className="text-center py-8 text-gray-600 dark:text-slate-400">
                            Loading issues...
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-600 dark:text-red-400">
                            Error: {error}
                        </div>
                    ) : filteredComplaints.length === 0 ? (
                        <div className="text-center py-8 text-gray-600 dark:text-slate-400">
                            {text[language].noComplaints}
                        </div>
                    ) : (
                        filteredComplaints.map((complaint) => (
                            <Card
                                key={complaint.id}
                                className="hover:shadow-md transition-shadow dark:hover:shadow-slate-800 border-indigo-50 dark:border-slate-700"
                            >
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {/* Header with ID, Category, and Evidence */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                                                        {complaint.id.slice(0, 8)}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-gray-600 dark:text-slate-400 text-sm">
                                                        {getCategoryIcon(complaint.category)}
                                                        <span>{complaint.department?.name || "N/A"}</span>
                                                    </div>
                                                </div>

                                                {/* Title and Description */}
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1">
                                                    {complaint.title}
                                                </h3>
                                                <p className="text-gray-600 dark:text-slate-400 text-sm mb-2">
                                                    {complaint.body || "No description provided"}
                                                </p>
                                                <p className="text-gray-500 dark:text-slate-500 text-xs">
                                                    {text[language].date}:{" "}
                                                    {formatDate(complaint.created_at)}
                                                </p>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="shrink-0">
                                                {getStatusBadge(complaint.status)}
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-slate-400">
                                                    {text[language].progress}
                                                </span>
                                                <span className="text-gray-900 dark:text-slate-100 font-medium">
                                                    {getProgressPercentage(complaint.status)}%
                                                </span>
                                            </div>
                                            <Progress
                                                value={getProgressPercentage(complaint.status)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
