import { supabase, getCurrentUser } from "./supabase";

/**
 * Submit new feedback for a resolved complaint.
 * Calls the submit_complaint_feedback RPC.
 */
export async function submitFeedback(complaintId, rating, feedbackText, isAnonymous) {
  const { data, error } = await supabase.rpc("submit_complaint_feedback", {
    p_complaint_id: complaintId,
    p_rating: rating,
    p_feedback_text: feedbackText || "",
    p_is_anonymous: isAnonymous || false,
  });

  if (error) {
    console.error("[feedback.submitFeedback] error:", error);
    throw error;
  }

  return data;
}

/**
 * Update existing feedback (allowed within 24 hours of creation).
 * Calls the update_complaint_feedback RPC.
 */
export async function updateFeedback(feedbackId, rating, feedbackText, isAnonymous) {
  const { data, error } = await supabase.rpc("update_complaint_feedback", {
    p_feedback_id: feedbackId,
    p_rating: rating,
    p_feedback_text: feedbackText || "",
    p_is_anonymous: isAnonymous || false,
  });

  if (error) {
    console.error("[feedback.updateFeedback] error:", error);
    throw error;
  }

  return data;
}

/**
 * Batch-fetch all feedback submitted by the current student.
 * Returns an array of feedback rows keyed by complaint_id.
 */
export async function getMyFeedback() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("complaint_feedback")
    .select("id, complaint_id, rating, feedback_text, is_anonymous, created_at")
    .eq("student_id", user.id);

  if (error) {
    console.error("[feedback.getMyFeedback] error:", error);
    throw error;
  }

  return data || [];
}

/**
 * Get department-level feedback statistics (coordinator).
 */
export async function getDeptFeedbackStats(deptId) {
  const { data, error } = await supabase.rpc("get_dept_feedback_stats", {
    p_dept_id: deptId,
  });

  if (error) {
    console.error("[feedback.getDeptFeedbackStats] error:", error);
    throw error;
  }

  // RPC may return array or single object
  return Array.isArray(data) ? data[0] || {} : data || {};
}

/**
 * Get system-wide feedback statistics (admin).
 */
export async function getAdminFeedbackStats() {
  const { data, error } = await supabase.rpc("get_admin_feedback_stats");

  if (error) {
    console.error("[feedback.getAdminFeedbackStats] error:", error);
    throw error;
  }

  return Array.isArray(data) ? data[0] || {} : data || {};
}

/**
 * Get department feedback leaderboard (admin).
 */
export async function getDeptFeedbackLeaderboard() {
  const { data, error } = await supabase.rpc("get_dept_feedback_leaderboard");

  if (error) {
    console.error("[feedback.getDeptFeedbackLeaderboard] error:", error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch feedback list from feedback_with_context view.
 * RLS handles access control (coordinator sees dept only, admin sees all).
 * @param {Object} filters - { rating, search, sortOrder, limit }
 */
export async function getFeedbackList(filters = {}) {
  const ascending = filters.sortOrder === "oldest";

  let query = supabase
    .from("feedback_with_context")
    .select("*")
    .order("created_at", { ascending });

  if (filters.rating) {
    query = query.eq("rating", parseInt(filters.rating));
  }

  if (filters.search) {
    query = query.ilike("complaint_title", `%${filters.search}%`);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[feedback.getFeedbackList] error:", error);
    throw error;
  }

  return data || [];
}
