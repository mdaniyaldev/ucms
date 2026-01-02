import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import {
  // Lucide icons
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Search,
  MessageSquare,
  PlayCircle,
  ShieldAlert,
  Inbox,
  Filter,
  User,
  Calendar,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  listDepartmentComplaints,
  setComplaintInProgress,
  resolveComplaint,
  escalateComplaint,
  addCoordinatorComment,
} from "../lib/coordinator";

export default function CoordinatorComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [commentText, setCommentText] = useState("");

  const refreshComplaints = async () => {
    try {
      setLoading(true);
      const data = await listDepartmentComplaints();
      setComplaints(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshComplaints();
  }, []);

  // Handlers
  const handleMarkInProgress = async (id) => {
    try {
      setActionLoading(true);
      await setComplaintInProgress(id);
      await refreshComplaints();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (id) => {
    if (!confirm("Are you sure you want to resolve this complaint?")) return;
    try {
      setActionLoading(true);
      await resolveComplaint(id);
      await refreshComplaints();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async (id) => {
    if (!confirm("Are you sure you want to escalate this to Admin?")) return;
    try {
      setActionLoading(true);
      await escalateComplaint(id);
      await refreshComplaints();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const submitComment = async () => {
    if (!selectedComplaintId || !commentText.trim()) return;
    try {
      setActionLoading(true);
      await addCoordinatorComment(selectedComplaintId, commentText);
      setCommentOpen(false);
      setCommentText("");
      setSelectedComplaintId(null);
      alert("Comment added successfully");
    } catch (err) {
      alert("Error adding comment: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // --- Filtering Logic ---
  const filteredComplaints = complaints.filter((c) => {
    let matchesStatus = true;
    if (filterStatus !== "all") {
      matchesStatus = c.status === filterStatus;
    }
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.student?.unique_id?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // --- Helpers ---
  const getStatusColor = (status) => {
    switch (status) {
      case "in_review":
        return "border-amber-400 bg-amber-50/50 dark:bg-amber-950/10";
      case "resolved":
        return "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/10";
      case "escalated":
        return "border-rose-500 bg-rose-50/50 dark:bg-rose-950/10";
      default: // open
        return "border-blue-400 bg-white dark:bg-slate-900";
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: {
        label: "Pending",
        className: "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
        icon: Clock,
      },
      in_review: {
        label: "In Review",
        className: "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
        icon: AlertTriangle,
      },
      resolved: {
        label: "Resolved",
        className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
        icon: CheckCircle,
      },
      escalated: {
        label: "Escalated",
        className: "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300",
        icon: TrendingUp,
      },
    };
    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`gap-1.5 border-0 px-2.5 py-1 ${config.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-8 p-1">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
            Department Complaints
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage, review, and resolve student issues efficiently.
          </p>
        </div>
        <div className="hidden md:block">
           <Badge variant="secondary" className="px-3 py-1 text-sm">
              {complaints.length} Total Records
           </Badge>
        </div>
      </div>

      {/* Controls & List */}
      <div className="space-y-4">
        {/* Filter Bar */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-4 -my-4 border-b border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title or student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 pl-10 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-56 border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Filter by Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Complaints</SelectItem>
                <SelectItem value="open">Pending</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Complaints Grid/List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 animate-pulse">
                <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-full mb-4"></div>
                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <Inbox className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No complaints found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                  There are no complaints matching your current filters or search query.
                </p>
                {filterStatus !== 'all' && (
                    <Button variant="link" onClick={() => setFilterStatus('all')} className="mt-4 text-blue-600">
                        Clear Filters
                    </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredComplaints.map((complaint) => (
                <Card
                  key={complaint.id}
                  className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md border-l-4 ${getStatusColor(complaint.status)}`}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
                      
                      {/* Content Section */}
                      <div className="space-y-3 flex-1 w-full">
                        {/* Meta Header */}
                        <div className="flex items-center gap-3 flex-wrap text-sm">
                          <span className="font-mono text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                            #{complaint.id.slice(0, 8)}
                          </span>
                          {getStatusBadge(complaint.status)}
                          <span className="flex items-center gap-1.5 text-xs text-slate-500">
                             <Calendar className="w-3.5 h-3.5" />
                             {new Date(complaint.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        {/* Title & Body */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                            {complaint.title}
                            </h3>
                            <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3">
                            {complaint.body}
                            </p>
                        </div>

                        {/* Footer Info */}
                        <div className="flex items-center gap-4 pt-2">
                             <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 py-1 px-2.5 rounded-full">
                                <User className="w-3 h-3" />
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {complaint.student?.unique_id || "Unknown Student"}
                                </span>
                             </div>
                             <Badge variant="outline" className={`text-xs ${
                                complaint.priority === 'high' ? 'text-red-600 border-red-200 bg-red-50' : 
                                complaint.priority === 'medium' ? 'text-orange-600 border-orange-200 bg-orange-50' : 
                                'text-slate-600'
                             }`}>
                                Priority: {complaint.priority}
                             </Badge>
                        </div>
                      </div>

                      {/* Actions Section */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 mt-2 lg:mt-0">
                        {complaint.status === "open" && (
                          <Button
                            size="sm"
                            className="w-full lg:w-32 justify-start lg:justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            onClick={() => handleMarkInProgress(complaint.id)}
                            disabled={actionLoading}
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Start Review
                          </Button>
                        )}

                        <div className="flex gap-2 w-full lg:w-auto">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 lg:flex-none border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800"
                            onClick={() => {
                              setSelectedComplaintId(complaint.id);
                              setCommentOpen(true);
                            }}
                            disabled={actionLoading}
                          >
                            <MessageSquare className="w-4 h-4 mr-2 text-slate-500" />
                            Comment
                          </Button>

                          {(complaint.status === "open" ||
                            complaint.status === "in_review") && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                onClick={() => handleEscalate(complaint.id)}
                                disabled={actionLoading}
                                title="Escalate to Admin"
                              >
                                <ShieldAlert className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleResolve(complaint.id)}
                                disabled={actionLoading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                              >
                                Resolve
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comment Dialog */}
      <Dialog open={commentOpen} onOpenChange={setCommentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Add Comment
            </DialogTitle>
            <DialogDescription>
              This comment will be added to the complaint timeline and is visible to the student.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
                placeholder="Type your response or update here..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={5}
                className="resize-none focus-visible:ring-blue-500"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCommentOpen(false)}>
              Cancel
            </Button>
            <Button 
                onClick={submitComment} 
                disabled={!commentText.trim() || actionLoading}
                className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}