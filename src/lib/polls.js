import { supabase, getCurrentUser } from "./supabase";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

export const POLL_STATUSES = ["draft", "published", "closed", "archived"];

/* ============================
   ADMIN SIDE
   ============================ */

export async function createPollWithOptions({
  title,
  description = "",
  options = [],
  startsAt = null,
  endsAt = null,
  status = "draft",
}) {
  await requireUser();

  if (!title || !title.trim()) {
    throw new Error("Poll title is required");
  }

  const cleanOptions = options
    .map((option) => String(option || "").trim())
    .filter(Boolean);

  if (cleanOptions.length < 2) {
    throw new Error("Poll must have at least 2 options");
  }

  if (!POLL_STATUSES.includes(status)) {
    throw new Error("Invalid poll status");
  }

  const { data, error } = await supabase.rpc("create_poll_with_options", {
    p_title: title.trim(),
    p_description: description?.trim() || null,
    p_options: cleanOptions,
    p_starts_at: startsAt,
    p_ends_at: endsAt,
    p_status: status,
  });

  if (error) {
    console.error("[polls.createPollWithOptions] error:", error);
    throw error;
  }

  return data; // poll id
}

export async function listAdminPolls({ status = null, limit = 100 } = {}) {
  await requireUser();

  let query = supabase
    .from("polls")
    .select(
      `
      id,
      title,
      description,
      status,
      starts_at,
      ends_at,
      is_anonymous,
      created_by,
      created_at,
      updated_at,
      poll_options(
        id,
        option_text,
        position
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[polls.listAdminPolls] error:", error);
    throw error;
  }

  return (data || []).map((poll) => ({
    ...poll,
    poll_options: [...(poll.poll_options || [])].sort(
      (a, b) => a.position - b.position
    ),
  }));
}

export async function getAdminPollById(pollId) {
  await requireUser();

  if (!pollId) {
    throw new Error("pollId is required");
  }

  const { data, error } = await supabase
    .from("polls")
    .select(
      `
      id,
      title,
      description,
      status,
      starts_at,
      ends_at,
      is_anonymous,
      created_by,
      created_at,
      updated_at,
      poll_options(
        id,
        option_text,
        position
      )
    `
    )
    .eq("id", pollId)
    .single();

  if (error) {
    console.error("[polls.getAdminPollById] error:", error);
    throw error;
  }

  return {
    ...data,
    poll_options: [...(data.poll_options || [])].sort(
      (a, b) => a.position - b.position
    ),
  };
}

export async function publishPoll(pollId) {
  await requireUser();

  if (!pollId) {
    throw new Error("pollId is required");
  }

  const { error } = await supabase.rpc("admin_publish_poll", {
    p_poll_id: pollId,
  });

  if (error) {
    console.error("[polls.publishPoll] error:", error);
    throw error;
  }

  return true;
}

export async function closePoll(pollId) {
  await requireUser();

  if (!pollId) {
    throw new Error("pollId is required");
  }

  const { error } = await supabase.rpc("admin_close_poll", {
    p_poll_id: pollId,
  });

  if (error) {
    console.error("[polls.closePoll] error:", error);
    throw error;
  }

  return true;
}

export async function updatePoll(pollId, updates = {}) {
  await requireUser();

  if (!pollId) {
    throw new Error("pollId is required");
  }

  const payload = {};

  if (typeof updates.title === "string") {
    if (!updates.title.trim()) {
      throw new Error("Poll title is required");
    }
    payload.title = updates.title.trim();
  }

  if (typeof updates.description === "string") {
    payload.description = updates.description.trim() || null;
  }

  if (updates.status) {
    if (!POLL_STATUSES.includes(updates.status)) {
      throw new Error("Invalid poll status");
    }
    payload.status = updates.status;
  }

  if ("startsAt" in updates) {
    payload.starts_at = updates.startsAt || null;
  }

  if ("endsAt" in updates) {
    payload.ends_at = updates.endsAt || null;
  }

  const { data, error } = await supabase
    .from("polls")
    .update(payload)
    .eq("id", pollId)
    .select(
      `
      id,
      title,
      description,
      status,
      starts_at,
      ends_at,
      is_anonymous,
      created_by,
      created_at,
      updated_at
    `
    )
    .single();

  if (error) {
    console.error("[polls.updatePoll] error:", error);
    throw error;
  }

  return data;
}

export async function deletePoll(pollId) {
  await requireUser();

  if (!pollId) {
    throw new Error("pollId is required");
  }

  const { error } = await supabase.from("polls").delete().eq("id", pollId);

  if (error) {
    console.error("[polls.deletePoll] error:", error);
    throw error;
  }

  return true;
}

export async function getPollResults(pollId) {
  await requireUser();

  if (!pollId) {
    throw new Error("pollId is required");
  }

  const { data, error } = await supabase.rpc("get_poll_results", {
    p_poll_id: pollId,
  });

  if (error) {
    console.error("[polls.getPollResults] error:", error);
    throw error;
  }

  return data || [];
}

export async function getAdminPollStats() {
  await requireUser();

  const { data, error } = await supabase.rpc("get_admin_poll_stats");

  if (error) {
    console.error("[polls.getAdminPollStats] error:", error);
    throw error;
  }

  return data?.[0] || {
    total_polls: 0,
    draft_count: 0,
    published_count: 0,
    closed_count: 0,
    archived_count: 0,
    total_votes: 0,
  };
}

/* ============================
   STUDENT SIDE
   ============================ */

export async function listStudentPolls({ limit = 100 } = {}) {
  await requireUser();

  const { data, error } = await supabase
    .from("polls")
    .select(
      `
      id,
      title,
      description,
      status,
      starts_at,
      ends_at,
      is_anonymous,
      created_at,
      updated_at,
      poll_options(
        id,
        option_text,
        position
      )
    `
    )
    .in("status", ["published", "closed"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[polls.listStudentPolls] error:", error);
    throw error;
  }

  return (data || []).map((poll) => ({
    ...poll,
    poll_options: [...(poll.poll_options || [])].sort(
      (a, b) => a.position - b.position
    ),
  }));
}

export async function getStudentPollById(pollId) {
  await requireUser();

  if (!pollId) {
    throw new Error("pollId is required");
  }

  const { data, error } = await supabase
    .from("polls")
    .select(
      `
      id,
      title,
      description,
      status,
      starts_at,
      ends_at,
      is_anonymous,
      created_at,
      updated_at,
      poll_options(
        id,
        option_text,
        position
      )
    `
    )
    .eq("id", pollId)
    .single();

  if (error) {
    console.error("[polls.getStudentPollById] error:", error);
    throw error;
  }

  return {
    ...data,
    poll_options: [...(data.poll_options || [])].sort(
      (a, b) => a.position - b.position
    ),
  };
}

export async function castPollVote({ pollId, optionId }) {
  await requireUser();

  if (!pollId) {
    throw new Error("pollId is required");
  }

  if (!optionId) {
    throw new Error("Please select an option");
  }

  const { error } = await supabase.rpc("cast_poll_vote", {
    p_poll_id: pollId,
    p_option_id: optionId,
  });

  if (error) {
    console.error("[polls.castPollVote] error:", error);
    throw error;
  }

  return true;
}

export async function hasVotedPoll(pollId) {
  await requireUser();

  if (!pollId) {
    throw new Error("pollId is required");
  }

  const { data, error } = await supabase.rpc("has_voted_poll", {
    p_poll_id: pollId,
  });

  if (error) {
    console.error("[polls.hasVotedPoll] error:", error);
    throw error;
  }

  return Boolean(data);
}