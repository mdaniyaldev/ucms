import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import RatingStars from "../ui/RatingStars";
import { submitFeedback, updateFeedback } from "../../lib/feedback";
import { Loader2 } from "lucide-react";

/**
 * FeedbackModal — dialog for submitting or editing complaint feedback.
 *
 * @param {boolean}  open            - Whether dialog is open
 * @param {function} onOpenChange    - Dialog open state handler
 * @param {string}   complaintId     - Complaint ID to submit feedback for
 * @param {string}   complaintTitle  - Complaint title for display
 * @param {object}   existingFeedback - If editing, the existing feedback object { id, rating, feedback_text, is_anonymous }
 * @param {function} onSuccess       - Callback after successful submit/update
 */
export default function FeedbackModal({
  open,
  onOpenChange,
  complaintId,
  complaintTitle,
  existingFeedback = null,
  onSuccess,
}) {
  const isEditing = !!existingFeedback;

  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [feedbackText, setFeedbackText] = useState(
    existingFeedback?.feedback_text || ""
  );
  const [isAnonymous, setIsAnonymous] = useState(
    existingFeedback?.is_anonymous || false
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) return;

    setSubmitting(true);
    setError(null);

    try {
      if (isEditing) {
        await updateFeedback(
          existingFeedback.id,
          rating,
          feedbackText,
          isAnonymous
        );
      } else {
        await submitFeedback(complaintId, rating, feedbackText, isAnonymous);
      }

      setSuccess(true);

      // Brief success flash, then close
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
        onSuccess?.();
      }, 800);
    } catch (err) {
      console.error("[FeedbackModal] submit error:", err);
      setError(err?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      // Reset state when closing
      if (!isEditing) {
        setRating(0);
        setFeedbackText("");
        setIsAnonymous(false);
      }
      setError(null);
      setSuccess(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Feedback" : "Give Feedback"}
          </DialogTitle>
          <DialogDescription>
            {complaintTitle
              ? `Feedback for: ${complaintTitle}`
              : "Rate your experience with the complaint resolution"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Rating <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <RatingStars value={rating} onChange={setRating} size="lg" />
              {rating > 0 && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {rating}/5
                </span>
              )}
            </div>
            {rating === 0 && error && (
              <p className="text-xs text-rose-500">Please select a rating</p>
            )}
          </div>

          {/* Feedback Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Comments{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <Textarea
              placeholder="Share your experience with the resolution..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Anonymous Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <div className="relative">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer-checked:bg-blue-600 transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
              Submit anonymously
            </span>
          </label>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-3">
              <p className="text-sm text-rose-600 dark:text-rose-400">
                {error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {isEditing
                  ? "Feedback updated successfully!"
                  : "Feedback submitted successfully!"}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? "Update" : "Submit"} Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
