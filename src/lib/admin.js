import { supabase } from "./supabase";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`;

export async function createUserAsAdmin({ uniqueId, password, role, department_id }) {
  // Must be signed in as admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`, // IMPORTANT
    },
    body: JSON.stringify({ uniqueId, password, role, department_id }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || `Failed (${res.status})`);
  }
  return json; // { ok: true, user_id: ... }
}

// Helper to verify admin role
async function requireAdmin() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    throw new Error("Not authenticated");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    console.warn("Admin profile check failed:", profileError);
    throw new Error("Profile not found");
  }

  if (profile.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return profile;
}

/**
 * Get system-wide complaint statistics for admin dashboard
 * Uses database RPC for optimized server-side calculation
 */
export async function getAdminStats() {
  await requireAdmin();

  const { data, error } = await supabase.rpc("get_admin_stats");

  if (error) {
    console.error("[admin.getAdminStats] error:", error);
    throw error;
  }

  // RPC returns an array with one row
  return data?.[0] || {
    total: 0,
    pending_count: 0,
    in_review_count: 0,
    resolved_count: 0,
    escalated_count: 0,
    avg_resolution_hours: 0,
  };
}

/**
 * Get all complaints with optional filters
 * @param {Object} filters - { status, category, departmentId, search }
 */
export async function getAllComplaints(filters = {}) {
  await requireAdmin();

  let query = supabase
    .from("complaints")
    .select(`
      id,
      title,
      body,
      category,
      status,
      priority,
      created_at,
      updated_at,
      due_at,
      resolved_at,
      student:profiles!student_id(unique_id, id, role),
      department:departments!department_id(name, id)
    `)
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters.departmentId) {
    query = query.eq("department_id", filters.departmentId);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,body.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[admin.getAllComplaints] error:", error);
    throw error;
  }

  return data || [];
}

/**
 * Update complaint status (admin can update any complaint)
 * @param {string} complaintId - Complaint ID
 * @param {string} status - New status (open, in_review, resolved, escalated)
 */
export async function updateComplaintStatus(complaintId, status) {
  await requireAdmin();

  const validStatuses = ["open", "in_review", "resolved", "escalated"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const updateData = { status };

  // If resolving, set resolved_at timestamp
  if (status === "resolved") {
    updateData.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("complaints")
    .update(updateData)
    .eq("id", complaintId)
    .select()
    .single();

  if (error) {
    console.error("[admin.updateComplaintStatus] error:", error);
    throw error;
  }

  return data;
}

/**
 * Get analytics data aggregated by department
 */
export async function getDepartmentAnalytics() {
  await requireAdmin();

  // Get all complaints with department info
  const { data: complaints, error } = await supabase
    .from("complaints")
    .select(`
      id,
      status,
      category,
      created_at,
      resolved_at,
      department:departments!department_id(id, name)
    `);

  if (error) {
    console.error("[admin.getDepartmentAnalytics] error:", error);
    throw error;
  }

  // Aggregate by department
  const deptMap = {};

  complaints.forEach((c) => {
    const deptName = c.department?.name || "Unassigned";
    if (!deptMap[deptName]) {
      deptMap[deptName] = {
        name: deptName,
        total: 0,
        resolved: 0,
        totalResolutionTime: 0,
      };
    }

    deptMap[deptName].total++;

    if (c.status === "resolved" && c.resolved_at && c.created_at) {
      deptMap[deptName].resolved++;
      const resolutionTime = new Date(c.resolved_at) - new Date(c.created_at);
      deptMap[deptName].totalResolutionTime += resolutionTime / (1000 * 60 * 60); // hours
    }
  });

  // Convert to array and calculate averages
  return Object.values(deptMap).map((dept) => ({
    name: dept.name,
    total: dept.total,
    resolved: dept.resolved,
    avgTime: dept.resolved > 0 ? (dept.totalResolutionTime / dept.resolved).toFixed(1) : 0,
  }));
}

/**
 * Get category distribution
 */
export async function getCategoryDistribution() {
  await requireAdmin();

  const { data: complaints, error } = await supabase
    .from("complaints")
    .select("category");

  if (error) {
    console.error("[admin.getCategoryDistribution] error:", error);
    throw error;
  }

  // Aggregate by category
  const categoryMap = {};
  complaints.forEach((c) => {
    const cat = c.category || "uncategorized";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  return Object.entries(categoryMap).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));
}

/**
 * Get trend data for the last N days
 * @param {number} days - Number of days to fetch (default 7)
 */
export async function getTrendData(days = 7) {
  await requireAdmin();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: complaints, error } = await supabase
    .from("complaints")
    .select("created_at, resolved_at, status")
    .gte("created_at", startDate.toISOString());

  if (error) {
    console.error("[admin.getTrendData] error:", error);
    throw error;
  }

  // Create array of last N days
  const trendMap = {};
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    trendMap[dateStr] = { submitted: 0, resolved: 0 };
  }

  // Count submissions and resolutions
  complaints.forEach((c) => {
    const createdDate = c.created_at.split("T")[0];
    if (trendMap[createdDate]) {
      trendMap[createdDate].submitted++;
    }

    if (c.resolved_at) {
      const resolvedDate = c.resolved_at.split("T")[0];
      if (trendMap[resolvedDate]) {
        trendMap[resolvedDate].resolved++;
      }
    }
  });

  // Convert to array with day labels
  return Object.entries(trendMap).map(([date, counts]) => {
    const dayLabel = new Date(date).toLocaleDateString("en-US", { weekday: "short" });
    return {
      day: dayLabel,
      submitted: counts.submitted,
      resolved: counts.resolved,
    };
  });
}