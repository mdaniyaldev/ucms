import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import RatingStars from "../ui/RatingStars";
import { MessageSquare, Calendar, Building2, User } from "lucide-react";

/**
 * FeedbackCard — displays a single feedback entry.
 *
 * @param {object} feedback - Feedback object from feedback_with_context view
 *   Expected fields: complaint_title, rating, feedback_text, department_name,
 *                    created_at, student_identifier, is_anonymous
 */
export default function FeedbackCard({ feedback }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow dark:hover:shadow-slate-800">
      <CardContent className="pt-6">
        <div className="space-y-3">
          {/* Header: Title + Rating */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {feedback.complaint_title || "Untitled Complaint"}
              </h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {feedback.department_name && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Building2 className="w-3 h-3" />
                    {feedback.department_name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {formatDate(feedback.created_at)}
                </span>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <RatingStars value={feedback.rating} readOnly size="sm" />
              {feedback.is_anonymous && (
                <Badge
                  variant="outline"
                  className="text-xs text-slate-500 dark:text-slate-400"
                >
                  Anonymous
                </Badge>
              )}
            </div>
          </div>

          {/* Feedback Text */}
          {feedback.feedback_text && (
            <div className="flex items-start gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feedback.feedback_text}
              </p>
            </div>
          )}

          {/* Student Identifier */}
          {feedback.student_identifier && !feedback.is_anonymous && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <User className="w-3 h-3" />
              <span>{feedback.student_identifier}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
