import { supabase, getCurrentUser } from "./supabase";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

export const COMPLAINT_CATEGORIES = [
  "academic",
  "it",
  "transport",
  "administrative",
];

export async function getMyProfile() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, unique_id, role, department_id, created_at")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("[student.getMyProfile] error:", error);
    throw error;
  }

  return data;
}

export async function listDepartments() {
  const { data, error } = await supabase
    .from("departments")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("[student.listDepartments] error:", error);
    throw error;
  }

  return data; // array of { id, name }
}

export async function createComplaint({ title, body, category, departmentId }) {
  const user = await requireUser();

  if (!title || !title.trim()) {
    throw new Error("Title is required");
  }

  if (!COMPLAINT_CATEGORIES.includes(category)) {
    throw new Error("Invalid complaint category");
  }

  if (!departmentId) {
    throw new Error("Department is required");
  }

  // set deadline = 5 days from now
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 5);

  const { data, error } = await supabase
    .from("complaints")
    .insert({
      title: title.trim(),
      body: body ?? "",
      category,
      department_id: departmentId,
      student_id: user.id, // RLS check uses this
      status: "open",
      due_at: dueAt.toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("[student.createComplaint] error:", error);
    throw error;
  }

  return data; // { id: '...' }
}

export async function listMyComplaints() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("complaints")
    .select(
      `
      id,
      title,
      category,
      status,
      department_id,
      created_at,
      updated_at,
      due_at,
      resolved_at,
      escalated_at,
      priority,
      department:departments(name)
    `
    )
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[student.listMyComplaints] error:", error);
    throw error;
  }

  return data; // array of complaints
}

export async function getMyComplaintById(complaintId) {
  if (!complaintId) {
    throw new Error("complaintId is required");
  }

  const { data, error } = await supabase
    .from("complaints")
    .select(
      `
      id,
      title,
      body,
      category,
      status,
      department_id,
      created_at,
      updated_at,
      due_at,
      resolved_at,
      escalated_at,
      priority
    `
    )
    .eq("id", complaintId)
    .single();

  if (error) {
    console.error("[student.getMyComplaintById] error:", error);
    throw error;
  }

  return data;
}

export async function updateMyOpenComplaint(complaintId, updates = {}) {
  const user = await requireUser();

  if (!complaintId) {
    throw new Error("complaintId is required");
  }

  const payload = {
    updated_at: new Date().toISOString(),
  };

  if (typeof updates.title === "string") {
    payload.title = updates.title.trim();
  }

  if (typeof updates.body === "string") {
    payload.body = updates.body;
  }

  if (updates.category) {
    if (!COMPLAINT_CATEGORIES.includes(updates.category)) {
      throw new Error("Invalid complaint category");
    }
    payload.category = updates.category;
  }

  if (updates.departmentId) {
    payload.department_id = updates.departmentId;
  }

  const { data, error } = await supabase
    .from("complaints")
    .update(payload)
    .eq("id", complaintId)
    .eq("student_id", user.id) // extra safety
    .select("id, status")
    .single();

  if (error) {
    console.error("[student.updateMyOpenComplaint] error:", error);
    throw error;
  }

  return data;
}
