import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Lightbulb,
  Loader2,
  AlertCircle,
  Inbox,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { listMySuggestions } from "../lib/suggestions";

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
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function MySuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  async function fetchSuggestions() {
    try {
      setLoading(true);
      setError(null);
      const data = await listMySuggestions();
      setSuggestions(data);
    } catch (err) {
      console.error("[MySuggestions] fetch error:", err);
      setError(err.message || "Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <Lightbulb className="w-7 h-7 text-amber-500" />
          My Suggestions
        </h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">
          Track the status of all your submitted suggestions.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading suggestions…
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-rose-500 gap-3">
          <AlertCircle className="w-12 h-12" />
          <p className="font-medium">{error}</p>
          <button
            onClick={fetchSuggestions}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Retry
          </button>
        </div>
      ) : suggestions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Inbox className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                No suggestions yet
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Submit your first suggestion to help improve the university.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => {
            const statusCfg = STATUS_CONFIG[suggestion.status] || STATUS_CONFIG.submitted;

            return (
              <Card
                key={suggestion.id}
                className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800"
              >
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1">
                          {suggestion.title}
                        </h3>
                      </div>
                      <div className="shrink-0">
                        <Badge className={statusCfg.className}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Body */}
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                      {suggestion.body}
                    </p>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>Submitted on {formatDate(suggestion.created_at)}</span>
                    </div>

                    {/* Admin Response */}
                    {suggestion.admin_response && (
                      <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                            Admin Response
                          </span>
                          {suggestion.reviewed_at && (
                            <span className="text-xs text-blue-600 dark:text-blue-400">
                              — {formatDate(suggestion.reviewed_at)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-blue-900 dark:text-blue-200 whitespace-pre-wrap">
                          {suggestion.admin_response}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
