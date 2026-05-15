import { supabase, getCurrentUser } from "./supabase";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

export const SUGGESTION_CATEGORIES = [
  "academic",
  "it",
  "transport",
  "administrative",
  "facilities",
  "other",
];

export const SUGGESTION_STATUSES = [
  "submitted",
  "reviewed",
  "accepted",
  "rejected",
  "archived",
];

/* ============================
   STUDENT SIDE
   ============================ */

export async function submitSuggestion({ title, body, category = "other" }) {
  await requireUser();

  if (!title || !title.trim()) {
    throw new Error("Suggestion title is required");
  }

  if (!body || !body.trim()) {
    throw new Error("Suggestion description is required");
  }

  if (!SUGGESTION_CATEGORIES.includes(category)) {
    throw new Error("Invalid suggestion category");
  }

  const { data, error } = await supabase.rpc("submit_suggestion", {
    p_title: title.trim(),
    p_body: body.trim(),
    p_category: category,
  });

  if (error) {
    console.error("[suggestions.submitSuggestion] error:", error);
    throw error;
  }

  return data; // suggestion id
}

export async function listMySuggestions() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("suggestions")
    .select(
      `
      id,
      title,
      body,
      category,
      status,
      admin_response,
      reviewed_at,
      created_at,
      updated_at
    `
    )
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[suggestions.listMySuggestions] error:", error);
    throw error;
  }

  return data || [];
}

export async function getMySuggestionById(suggestionId) {
  await requireUser();

  if (!suggestionId) {
    throw new Error("suggestionId is required");
  }

  const { data, error } = await supabase
    .from("suggestions")
    .select(
      `
      id,
      title,
      body,
      category,
      status,
      admin_response,
      reviewed_at,
      created_at,
      updated_at
    `
    )
    .eq("id", suggestionId)
    .single();

  if (error) {
    console.error("[suggestions.getMySuggestionById] error:", error);
    throw error;
  }

  return data;
}

export async function updateMySubmittedSuggestion(suggestionId, updates = {}) {
  await requireUser();

  if (!suggestionId) {
    throw new Error("suggestionId is required");
  }

  const payload = {};

  if (typeof updates.title === "string") {
    if (!updates.title.trim()) {
      throw new Error("Suggestion title is required");
    }
    payload.title = updates.title.trim();
  }

  if (typeof updates.body === "string") {
    if (!updates.body.trim()) {
      throw new Error("Suggestion description is required");
    }
    payload.body = updates.body.trim();
  }

  if (updates.category) {
    if (!SUGGESTION_CATEGORIES.includes(updates.category)) {
      throw new Error("Invalid suggestion category");
    }
    payload.category = updates.category;
  }

  const { data, error } = await supabase
    .from("suggestions")
    .update(payload)
    .eq("id", suggestionId)
    .eq("status", "submitted")
    .select(
      `
      id,
      title,
      body,
      category,
      status,
      admin_response,
      reviewed_at,
      created_at,
      updated_at
    `
    )
    .single();

  if (error) {
    console.error("[suggestions.updateMySubmittedSuggestion] error:", error);
    throw error;
  }

  return data;
}

/* ============================
   ADMIN SIDE
   ============================ */

export async function listAllSuggestions({
  status = null,
  category = null,
  limit = 100,
} = {}) {
  await requireUser();

  let query = supabase
    .from("suggestions")
    .select(
      `
      id,
      title,
      body,
      category,
      status,
      admin_response,
      reviewed_at,
      created_at,
      updated_at,
      submitted_by,
      reviewed_by,
      submitter:profiles!suggestions_submitted_by_fkey(
        id,
        unique_id,
        role,
        department_id
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq("status", status);
  }

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[suggestions.listAllSuggestions] error:", error);
    throw error;
  }

  return data || [];
}

export async function getSuggestionById(suggestionId) {
  await requireUser();

  if (!suggestionId) {
    throw new Error("suggestionId is required");
  }

  const { data, error } = await supabase
    .from("suggestions")
    .select(
      `
      id,
      title,
      body,
      category,
      status,
      admin_response,
      submitted_by,
      reviewed_by,
      reviewed_at,
      created_at,
      updated_at,
      submitter:profiles!suggestions_submitted_by_fkey(
        id,
        unique_id,
        role,
        department_id
      )
    `
    )
    .eq("id", suggestionId)
    .single();

  if (error) {
    console.error("[suggestions.getSuggestionById] error:", error);
    throw error;
  }

  return data;
}

export async function updateSuggestionStatus({
  suggestionId,
  status,
  adminResponse = null,
}) {
  await requireUser();

  if (!suggestionId) {
    throw new Error("suggestionId is required");
  }

  if (!SUGGESTION_STATUSES.includes(status)) {
    throw new Error("Invalid suggestion status");
  }

  const { error } = await supabase.rpc("admin_update_suggestion_status", {
    p_suggestion_id: suggestionId,
    p_status: status,
    p_admin_response: adminResponse,
  });

  if (error) {
    console.error("[suggestions.updateSuggestionStatus] error:", error);
    throw error;
  }

  return true;
}

export async function deleteSuggestion(suggestionId) {
  await requireUser();

  if (!suggestionId) {
    throw new Error("suggestionId is required");
  }

  const { error } = await supabase
    .from("suggestions")
    .delete()
    .eq("id", suggestionId);

  if (error) {
    console.error("[suggestions.deleteSuggestion] error:", error);
    throw error;
  }

  return true;
}

export async function getAdminSuggestionStats() {
  await requireUser();

  const { data, error } = await supabase.rpc("get_admin_suggestion_stats");

  if (error) {
    console.error("[suggestions.getAdminSuggestionStats] error:", error);
    throw error;
  }

  return data?.[0] || {
    total: 0,
    submitted_count: 0,
    reviewed_count: 0,
    accepted_count: 0,
    rejected_count: 0,
    archived_count: 0,
  };
}