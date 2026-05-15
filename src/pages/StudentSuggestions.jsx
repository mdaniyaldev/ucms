import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
  Lightbulb,
} from "lucide-react";
import {
  submitSuggestion,
  SUGGESTION_CATEGORIES,
} from "../lib/suggestions";
import { useNavigate } from "react-router-dom";

const CATEGORY_LABELS = {
  academic: "Academic",
  it: "IT Services",
  transport: "Transport",
  administrative: "Administrative",
  facilities: "Facilities",
  other: "Other",
};

export function StudentSuggestions() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Suggestion title is required");
      return;
    }
    if (!category) {
      setError("Please select a category");
      return;
    }
    if (!body.trim()) {
      setError("Suggestion description is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await submitSuggestion({ title: title.trim(), body: body.trim(), category });
      setSuccess(true);
      setTitle("");
      setCategory("");
      setBody("");
    } catch (err) {
      console.error("Error submitting suggestion:", err);
      setError(err.message || "Failed to submit suggestion");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl">
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-600 dark:text-green-400" />
              <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                Suggestion Submitted Successfully!
              </h3>
              <p className="text-green-800 dark:text-green-200">
                Your suggestion has been submitted and will be reviewed by the administration.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setSuccess(false)}
                  className="mt-4"
                >
                  Submit Another
                </Button>
                <Button
                  onClick={() => navigate("/student/my-suggestions")}
                  variant="outline"
                  className="mt-4"
                >
                  View My Suggestions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Submit a Suggestion
          </CardTitle>
          <CardDescription>
            Share your ideas and suggestions to help improve the university experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-800 dark:text-red-200 text-sm">
                  {error}
                </p>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="suggestion-title"
                className="block text-sm font-medium text-gray-700 dark:text-slate-200"
              >
                Title
              </label>
              <input
                id="suggestion-title"
                type="text"
                placeholder="Brief title for your suggestion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label
                htmlFor="suggestion-category"
                className="block text-sm font-medium text-gray-700 dark:text-slate-200"
              >
                Category
              </label>
              <select
                id="suggestion-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
              >
                <option value="">Select a category</option>
                {SUGGESTION_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat] || cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="suggestion-body"
                className="block text-sm font-medium text-gray-700 dark:text-slate-200"
              >
                Description
              </label>
              <textarea
                id="suggestion-body"
                placeholder="Describe your suggestion in detail..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1 gap-2">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {loading ? "Submitting..." : "Submit Suggestion"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/student-dashboard")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
