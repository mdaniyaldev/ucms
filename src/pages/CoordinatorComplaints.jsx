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
  } from "../components/ui/dialog"
import { Textarea } from "../components/ui/textarea"
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

  // NOTE: According to RLS, coordinators might not be able to escalate directly via update?
  // Actually the trigger allows: open/in_review -> escalated.
  // So we can implement this.
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
    } catch(err) {
        alert("Error adding comment: " + err.message);
    } finally {
        setActionLoading(false);
    }
  }

  // --- Filtering Logic ---
  const filteredComplaints = complaints.filter((c) => {
    let matchesStatus = true;
    if (filterStatus !== "all") {
      matchesStatus = c.status === filterStatus;
    }
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.student?.unique_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // --- Helpers ---
  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { label: "Pending", variant: "secondary", icon: Clock },
      in_review: { label: "In Review", variant: "secondary", icon: AlertTriangle },
      resolved: { label: "Resolved", variant: "default", icon: CheckCircle },
      escalated: { label: "Escalated", variant: "destructive", icon: TrendingUp },
    };
    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
          Department Complaints
        </h1>
        <p className="text-gray-600 dark:text-slate-400">
          Manage and track complaints assigned to your department
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title or student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 pl-10 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Pending</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
            {loading ? (
                 <div className="text-center py-12 text-slate-500">Loading complaints...</div>
            ) : filteredComplaints.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No complaints found matching your criteria.</div>
            ) : (
                filteredComplaints.map(complaint => (
                    <Card key={complaint.id} className="overflow-hidden border-l-4 border-l-slate-400">
                         {/* Optional: dynamic border color based on status */}
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                            {complaint.id.slice(0,8)}
                                        </span>
                                        {getStatusBadge(complaint.status)}
                                        <span className="text-xs text-slate-500">
                                            {new Date(complaint.created_at).toLocaleDateString()}
                                        </span>
                                        <Badge variant="outline" className="text-slate-600">
                                            Priority: {complaint.priority}
                                        </Badge>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                        {complaint.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                                        {complaint.body}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Submitted by: <span className="font-medium text-slate-700 dark:text-slate-300">{complaint.student?.unique_id}</span>
                                    </p>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                                    {complaint.status === 'open' && (
                                        <Button size="sm" onClick={() => handleMarkInProgress(complaint.id)} disabled={actionLoading}>
                                            <PlayCircle className="w-4 h-4 mr-2" />
                                            Start Review
                                        </Button>
                                    )}
                                    
                                    {/* Action buttons */}
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => {
                                            setSelectedComplaintId(complaint.id);
                                            setCommentOpen(true);
                                        }} disabled={actionLoading}>
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Comment
                                        </Button>
                                        
                                        {(complaint.status === 'open' || complaint.status === 'in_review') && (
                                            <>
                                                 <Button variant="outline" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => handleEscalate(complaint.id)} disabled={actionLoading}>
                                                    <ShieldAlert className="w-4 h-4" />
                                                </Button>
                                                <Button variant="default" size="sm" onClick={() => handleResolve(complaint.id)} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700">
                                                    Resolve
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </CardContent>
      </Card>

      {/* Comment Dialog */}
      <Dialog open={commentOpen} onOpenChange={setCommentOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Comment</DialogTitle>
                <DialogDescription>
                    This comment will be visible to the student.
                </DialogDescription>
            </DialogHeader>
            <Textarea 
                placeholder="Type your comment here..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
            />
            <DialogFooter>
                <Button variant="outline" onClick={() => setCommentOpen(false)}>Cancel</Button>
                <Button onClick={submitComment} disabled={!commentText.trim() || actionLoading}>Submit Comment</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
