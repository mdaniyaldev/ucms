import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Search, Loader2, AlertTriangle, MessageSquareText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getFeedbackList } from "../lib/feedback";
import FeedbackCard from "../components/feedback/FeedbackCard";

export default function CoordinatorFeedback() {
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      const feedbackData = await getFeedbackList({ limit: 100 });

      setFeedbackList(feedbackData);
    } catch (err) {
      console.error("[CoordinatorFeedback] fetch error:", err);
      setError(err.message || "Failed to load feedback data");
    } finally {
      setLoading(false);
    }
  }

  // Client-side filtering
  const filteredFeedback = feedbackList
    .filter((f) => {
      if (ratingFilter !== "all" && f.rating !== parseInt(ratingFilter))
        return false;
      if (
        searchQuery &&
        !f.complaint_title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 gap-2 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading feedback data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <p className="text-rose-600 font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
          Feedback & Ratings
        </h1>
        <p className="text-gray-600 dark:text-slate-400">
          Student feedback for your department's complaint resolutions
        </p>
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by complaint title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 pl-10 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Rating Filter */}
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredFeedback.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquareText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No feedback found
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Feedback will appear here once students rate resolved complaints
              </p>
            </div>
          ) : (
            filteredFeedback.map((fb, i) => (
              <FeedbackCard key={fb.id || i} feedback={fb} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
