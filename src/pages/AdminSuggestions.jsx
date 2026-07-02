import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  Filter,
  Lightbulb,
  Inbox,
  Calendar,
  User,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Archive,
  FileText,
} from "lucide-react";
import {
  listAllSuggestions,
  updateSuggestionStatus,
  getAdminSuggestionStats,
  SUGGESTION_CATEGORIES,
  SUGGESTION_STATUSES,
} from "../lib/suggestions";

const CATEGORY_LABELS = {
  academic: "Academic",
  it: "IT Services",
  transport: "Transport",
  administrative: "Administrative",
  facilities: "Facilities",
  other: "Other",
};

const STATUS_CONFIG = {
  submitted: {
    label: "Submitted",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-transparent",
  },
  reviewed: {
    label: "Reviewed",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-transparent",
  },
  accepted: {
    label: "Accepted",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-transparent",
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-transparent",
  },
  archived: {
    label: "Archived",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-transparent",
  },
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Stats
  const [stats, setStats] = useState(null);

  // Response modal
  const [respondTo, setRespondTo] = useState(null);
  const [responseStatus, setResponseStatus] = useState("reviewed");
  const [responseText, setResponseText] = useState("");
  const [responseLoading, setResponseLoading] = useState(false);
  const [responseError, setResponseError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [statusFilter, categoryFilter]);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (categoryFilter !== "all") filters.category = categoryFilter;

      const [suggestionsData, statsData] = await Promise.all([
        listAllSuggestions(filters),
        getAdminSuggestionStats(),
      ]);

      setSuggestions(suggestionsData);
      setStats(statsData);
    } catch (err) {
      console.error("[AdminSuggestions] fetch error:", err);
      setError(err.message || "Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickStatusChange(suggestionId, newStatus) {
    try {
      setUpdating(suggestionId);
      await updateSuggestionStatus({ suggestionId, status: newStatus });
      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId ? { ...s, status: newStatus } : s
        )
      );
    } catch (err) {
      console.error("[AdminSuggestions] status update error:", err);
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdating(null);
    }
  }

  async function handleResponseSubmit() {
    if (!respondTo) return;

    try {
      setResponseLoading(true);
      setResponseError(null);
      await updateSuggestionStatus({
        suggestionId: respondTo.id,
        status: responseStatus,
        adminResponse: responseText.trim() || null,
      });

      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === respondTo.id
            ? { ...s, status: responseStatus, admin_response: responseText.trim() || s.admin_response }
            : s
        )
      );

      setRespondTo(null);
      setResponseText("");
      setResponseStatus("reviewed");
    } catch (err) {
      console.error("[AdminSuggestions] response error:", err);
      setResponseError(err.message || "Failed to update suggestion");
    } finally {
      setResponseLoading(false);
    }
  }

  const statCards = stats
    ? [
        {
          label: "Total",
          value: stats.total,
          icon: FileText,
          chip: "bg-blue-100 text-blue-600",
        },
        {
          label: "Submitted",
          value: stats.submitted_count,
          icon: Clock,
          chip: "bg-amber-100 text-amber-600",
        },
        {
          label: "Accepted",
          value: stats.accepted_count,
          icon: CheckCircle2,
          chip: "bg-emerald-100 text-emerald-600",
        },
        {
          label: "Rejected",
          value: stats.rejected_count,
          icon: XCircle,
          chip: "bg-rose-100 text-rose-600",
        },
        {
          label: "Archived",
          value: stats.archived_count,
          icon: Archive,
          chip: "bg-gray-100 text-gray-600",
        },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-500" />
            Suggestions Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Review and respond to student suggestions.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
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
                      <span className="text-2xl font-semibold">{stat.value}</span>
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
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 border rounded-lg text-sm px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  {SUGGESTION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border rounded-lg text-sm px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {SUGGESTION_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c] || c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>All Suggestions ({suggestions.length})</span>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="flex flex-col items-center justify-center py-12 text-rose-500 gap-3">
                <AlertCircle className="w-12 h-12" />
                <p className="font-medium">{error}</p>
                <Button onClick={fetchData} variant="outline" size="sm">
                  Retry
                </Button>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12 text-slate-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading suggestions…
              </div>
            ) : suggestions.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No suggestions found matching your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion) => {
                  const statusCfg =
                    STATUS_CONFIG[suggestion.status] || STATUS_CONFIG.submitted;

                  return (
                    <Card
                      key={suggestion.id}
                      className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800"
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge className={statusCfg.className}>
                                  {statusCfg.label}
                                </Badge>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    {
                                      academic: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                                      it: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
                                      transport: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                                      administrative: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
                                      facilities: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
                                      other: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                                    }[suggestion.category] || "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {CATEGORY_LABELS[suggestion.category] || suggestion.category}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 break-words">
                                {suggestion.title}
                              </h3>
                            </div>
                          </div>

                          {/* Body */}
                          <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                            {suggestion.body}
                          </p>

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            {suggestion.submitter?.unique_id && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{suggestion.submitter.unique_id}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(suggestion.created_at)}</span>
                            </div>
                          </div>

                          {/* Admin Response if exists */}
                          {suggestion.admin_response && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                                  Admin Response
                                </span>
                              </div>
                              <p className="text-sm text-blue-900 dark:text-blue-200 whitespace-pre-wrap">
                                {suggestion.admin_response}
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 flex-wrap">
                            <Button
                              onClick={() => {
                                setRespondTo(suggestion);
                                setResponseStatus(
                                  suggestion.status === "submitted" ? "reviewed" : suggestion.status
                                );
                                setResponseText(suggestion.admin_response || "");
                                setResponseError(null);
                              }}
                              size="sm"
                              variant="outline"
                              className="gap-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Respond
                            </Button>

                            {suggestion.status !== "accepted" && (
                              <Button
                                onClick={() => handleQuickStatusChange(suggestion.id, "accepted")}
                                disabled={updating === suggestion.id}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 gap-1"
                              >
                                {updating === suggestion.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3 h-3" />
                                )}
                                Accept
                              </Button>
                            )}

                            {suggestion.status !== "rejected" && (
                              <Button
                                onClick={() => handleQuickStatusChange(suggestion.id, "rejected")}
                                disabled={updating === suggestion.id}
                                size="sm"
                                variant="destructive"
                                className="gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                Reject
                              </Button>
                            )}

                            {suggestion.status !== "archived" && (
                              <Button
                                onClick={() => handleQuickStatusChange(suggestion.id, "archived")}
                                disabled={updating === suggestion.id}
                                size="sm"
                                variant="ghost"
                                className="gap-1 text-slate-500"
                              >
                                <Archive className="w-3 h-3" />
                                Archive
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Response Modal */}
      {respondTo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Respond to Suggestion</span>
                <button
                  onClick={() => setRespondTo(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Suggestion
                </label>
                <p className="font-semibold text-sm">{respondTo.title}</p>
              </div>

              {responseError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200 text-sm">{responseError}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                  Status
                </label>
                <select
                  value={responseStatus}
                  onChange={(e) => setResponseStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                >
                  <option value="reviewed">Reviewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                  Admin Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  placeholder="Write your response to this suggestion..."
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleResponseSubmit}
                  disabled={responseLoading}
                  className="flex-1 gap-2"
                >
                  {responseLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {responseLoading ? "Updating..." : "Update Suggestion"}
                </Button>
                <Button
                  onClick={() => setRespondTo(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
