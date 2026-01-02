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


export async function listDepartmentsWithCategories() {
  const { data, error } = await supabase
    .from("departments")
    .select(
      `
      id,
      name,
      department_categories(category)
    `
    )
    .order("name", { ascending: true });

  if (error) {
    console.error("[student.listDepartmentsWithCategories] error:", error);
    throw error;
  }

  return data.map((dept) => ({
    id: dept.id,
    name: dept.name,
    categories: dept.department_categories?.map((dc) => dc.category) || [],
  }));
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

  
  const { data, error } = await supabase
    .from("complaints")
    .insert({
      title: title.trim(),
      body: body ?? "",
      category,
      department_id: departmentId,
      student_id: user.id, // RLS check uses this
      status: "open",
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
      body,
      category,
      status,
      department_id,
      created_at,
      updated_at,
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
    .eq("student_id", user.id)
    .select("id, status")
    .single();

  if (error) {
    console.error("[student.updateMyOpenComplaint] error:", error);
    throw error;
  }

  return data;
}


export async function listMyNotifications({ onlyUnread = false, limit = 50 } = {}) {
  const user = await requireUser();

  let q = supabase
    .from("notifications")
    .select("id, complaint_id, type, title, message, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (onlyUnread) q = q.eq("is_read", false);

  const { data, error } = await q;

  if (error) {
    console.error("[student.listMyNotifications] error:", error);
    throw error;
  }

  return data || [];
}


export async function getUnreadNotificationCount() {
  const user = await requireUser();

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("[student.getUnreadNotificationCount] error:", error);
    throw error;
  }

  return count ?? 0;
}


export async function markNotificationRead(notificationId) {
  await requireUser();

  if (!notificationId) throw new Error("notificationId is required");

  const { error } = await supabase.rpc("mark_notification_read", {
    notification_id: notificationId,
  });

  if (error) {
    console.error("[student.markNotificationRead] error:", error);
    throw error;
  }

  return true;
}


export async function markAllNotificationsRead() {
  await requireUser();

  const { error } = await supabase.rpc("mark_all_notifications_read");

  if (error) {
    console.error("[student.markAllNotificationsRead] error:", error);
    throw error;
  }

  return true;
}


export async function subscribeToMyNotifications(onNewNotification) {
  const user = await requireUser();

  const channel = supabase
    .channel(`notifications:${user.id}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        // payload.new is the notification row
        onNewNotification?.(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
