import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  Filter,
  BarChart3,
  Inbox,
  Calendar,
  Plus,
  Trash2,
  Eye,
  Send,
  Lock,
  FileText,
  CheckCircle2,
  Clock,
  Archive,
  X,
} from "lucide-react";
import {
  createPollWithOptions,
  listAdminPolls,
  publishPoll,
  closePoll,
  deletePoll,
  getPollResults,
  getAdminPollStats,
  POLL_STATUSES,
} from "../lib/polls";

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-transparent",
  },
  published: {
    label: "Published",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-transparent",
  },
  closed: {
    label: "Closed",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-transparent",
  },
  archived: {
    label: "Archived",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-transparent",
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

function PollResultsView({ pollId }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getPollResults(pollId);
        setResults(data);
      } catch (err) {
        setError(err.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [pollId]);

  const totalVotes = results.reduce((sum, r) => sum + (r.vote_count || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-slate-500 text-sm">
        <Loader2 className="w-3 h-3 animate-spin" />
        Loading results...
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-rose-500">{error}</p>;
  }

  if (results.length === 0) {
    return <p className="text-sm text-slate-400">No results available</p>;
  }

  return (
    <div className="space-y-2">
      {results.map((result) => {
        const pct = result.percentage != null ? Number(result.percentage) : 0;
        return (
          <div key={result.option_id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-200 font-medium">
                {result.option_text}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">
                {result.vote_count || 0} vote{result.vote_count !== 1 ? "s" : ""} ({pct.toFixed(1)}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">
        Total votes: {totalVotes}
      </p>
    </div>
  );
}

export default function AdminPolls() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");

  // Stats
  const [stats, setStats] = useState(null);

  // Expanded results
  const [expandedResults, setExpandedResults] = useState({});

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    options: ["", ""],
    startsAt: "",
    endsAt: "",
    status: "draft",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;

      const [pollsData, statsData] = await Promise.all([
        listAdminPolls(filters),
        getAdminPollStats(),
      ]);

      setPolls(pollsData);
      setStats(statsData);
    } catch (err) {
      console.error("[AdminPolls] fetch error:", err);
      setError(err.message || "Failed to load polls");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handlePublish(pollId) {
    try {
      setActionLoading(pollId);
      await publishPoll(pollId);
      await fetchData();
    } catch (err) {
      alert("Failed to publish: " + err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleClose(pollId) {
    try {
      setActionLoading(pollId);
      await closePoll(pollId);
      await fetchData();
    } catch (err) {
      alert("Failed to close: " + err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(pollId) {
    if (!confirm("Are you sure you want to delete this poll?")) return;
    try {
      setActionLoading(pollId);
      await deletePoll(pollId);
      await fetchData();
    } catch (err) {
      alert("Failed to delete: " + err.message);
    } finally {
      setActionLoading(null);
    }
  }

  function toggleResults(pollId) {
    setExpandedResults((prev) => ({
      ...prev,
      [pollId]: !prev[pollId],
    }));
  }

  // Create poll handlers
  function addOption() {
    setCreateForm((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  }

  function removeOption(index) {
    if (createForm.options.length <= 2) return;
    setCreateForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  }

  function updateOption(index, value) {
    setCreateForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  }

  async function handleCreate(e) {
    e.preventDefault();

    if (!createForm.title.trim()) {
      setCreateError("Poll title is required");
      return;
    }

    const validOptions = createForm.options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      setCreateError("At least 2 options are required");
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError(null);

      await createPollWithOptions({
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        options: createForm.options,
        startsAt: createForm.startsAt || null,
        endsAt: createForm.endsAt || null,
        status: createForm.status,
      });

      setShowCreate(false);
      setCreateForm({
        title: "",
        description: "",
        options: ["", ""],
        startsAt: "",
        endsAt: "",
        status: "draft",
      });

      await fetchData();
    } catch (err) {
      console.error("[AdminPolls] create error:", err);
      setCreateError(err.message || "Failed to create poll");
    } finally {
      setCreateLoading(false);
    }
  }

  const statCards = stats
    ? [
        {
          label: "Total Polls",
          value: stats.total_polls,
          icon: FileText,
          chip: "bg-blue-100 text-blue-600",
        },
        {
          label: "Draft",
          value: stats.draft_count,
          icon: Clock,
          chip: "bg-gray-100 text-gray-600",
        },
        {
          label: "Published",
          value: stats.published_count,
          icon: CheckCircle2,
          chip: "bg-emerald-100 text-emerald-600",
        },
        {
          label: "Closed",
          value: stats.closed_count,
          icon: Lock,
          chip: "bg-amber-100 text-amber-600",
        },
        {
          label: "Total Votes",
          value: stats.total_votes,
          icon: BarChart3,
          chip: "bg-violet-100 text-violet-600",
        },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-500" />
              Polls Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create, manage, and view poll results.
            </p>
          </div>

          <Button onClick={() => setShowCreate(true)} className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Create Poll
          </Button>
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
            <div className="flex items-center gap-2 max-w-xs">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 border rounded-lg text-sm px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                {POLL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Polls List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>All Polls ({polls.length})</span>
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
                Loading polls…
              </div>
            ) : polls.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No polls found matching your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {polls.map((poll) => {
                  const statusCfg = STATUS_CONFIG[poll.status] || STATUS_CONFIG.draft;

                  return (
                    <Card
                      key={poll.id}
                      className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800"
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={statusCfg.className}>
                                  {statusCfg.label}
                                </Badge>
                              </div>
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 break-words">
                                {poll.title}
                              </h3>
                              {poll.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                  {poll.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Options */}
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              Options:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(poll.poll_options || []).map((opt) => (
                                <span
                                  key={opt.id}
                                  className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                                >
                                  {opt.option_text}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Dates */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Created: {formatDate(poll.created_at)}</span>
                            </div>
                            {poll.starts_at && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Starts: {formatDate(poll.starts_at)}</span>
                              </div>
                            )}
                            {poll.ends_at && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Ends: {formatDate(poll.ends_at)}</span>
                              </div>
                            )}
                          </div>

                          {/* Results (expandable) */}
                          {expandedResults[poll.id] && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                              <PollResultsView pollId={poll.id} />
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 flex-wrap">
                            <Button
                              onClick={() => toggleResults(poll.id)}
                              size="sm"
                              variant="outline"
                              className="gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              {expandedResults[poll.id] ? "Hide Results" : "View Results"}
                            </Button>

                            {poll.status === "draft" && (
                              <Button
                                onClick={() => handlePublish(poll.id)}
                                disabled={actionLoading === poll.id}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 gap-1"
                              >
                                {actionLoading === poll.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Send className="w-3 h-3" />
                                )}
                                Publish
                              </Button>
                            )}

                            {poll.status === "published" && (
                              <Button
                                onClick={() => handleClose(poll.id)}
                                disabled={actionLoading === poll.id}
                                size="sm"
                                variant="secondary"
                                className="gap-1"
                              >
                                {actionLoading === poll.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Lock className="w-3 h-3" />
                                )}
                                Close
                              </Button>
                            )}

                            {(poll.status === "draft" || poll.status === "closed") && (
                              <Button
                                onClick={() => handleDelete(poll.id)}
                                disabled={actionLoading === poll.id}
                                size="sm"
                                variant="ghost"
                                className="gap-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
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

      {/* Create Poll Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Create New Poll</span>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                {createError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-800 dark:text-red-200 text-sm">{createError}</p>
                  </div>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                    Poll Title
                  </label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter poll title"
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                    Description (Optional)
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Describe this poll..."
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 resize-none"
                  />
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                    Options (min 2)
                  </label>
                  <div className="space-y-2">
                    {createForm.options.map((opt, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                        />
                        {createForm.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Option
                  </Button>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                      Starts At (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={createForm.startsAt}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          startsAt: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                      Ends At (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={createForm.endsAt}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          endsAt: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                    Initial Status
                  </label>
                  <select
                    value={createForm.status}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 gap-2"
                  >
                    {createLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {createLoading ? "Creating..." : "Create Poll"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
