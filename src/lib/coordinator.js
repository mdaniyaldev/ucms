import { supabase, getCurrentUser } from "./supabase";

export async function requireCoordinator() {
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
        console.warn("Coordinator profile check failed:", profileError);
        throw new Error("Profile not found");
    }

    if (profile.role !== "coordinator") {
        throw new Error("Unauthorized: Coordinator access required");
    }

    return profile;
}

export async function getDeptStats() {
    const user = await requireCoordinator();

    if (!user.department_id) {
        throw new Error("No department assigned to this coordinator");
    }

    const { data, error } = await supabase.rpc("get_dept_complaint_stats", {
        dept_id: user.department_id,
    });

    if (error) {
        console.error("[coordinator.getDeptStats] error:", error);
        throw error;
    }

    // RPC returns an array of rows, usually just one row for this function
    return data?.[0] || {
        total: 0,
        open_count: 0,
        in_review_count: 0,
        resolved_count: 0,
        overdue_count: 0,
        avg_resolution_hours: 0,
    };
}

export async function listDepartmentComplaints() {
    const user = await requireCoordinator();

    if (!user.department_id) {
        throw new Error("No department assigned");
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
      created_at,
      updated_at,
      due_at,
      resolved_at,
      priority,
      student:profiles!student_id(unique_id, role),
      attachments:complaint_attachments(id, file_path, original_name, file_type, bucket_name, mime_type)
    `
        )
        .eq("department_id", user.department_id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[coordinator.listDepartmentComplaints] error:", error);
        throw error;
    }

    return data;
}

export async function setComplaintInProgress(complaintId) {
    await requireCoordinator();

    const { data, error } = await supabase
        .from("complaints")
        .update({ status: "in_review" })
        .eq("id", complaintId)
        .single();

    if (error) {
        console.error("[coordinator.setComplaintInProgress] error:", error);
        throw error;
    }

    return data;
}

export async function resolveComplaint(complaintId) {
    await requireCoordinator();

    // Try to resolve directly. RLS/Trigger might block if no escalation,
    // but checking the user request, it seems admins might be the only ones to resolve escalated ones.
    // HOWEVER, the coordinator trigger says:
    // if OLD.status = 'in_review' and NEW.status = 'resolved' then ALLOWED.
    // So coordinators CAN resolve if it's currently 'in_review'.

    const { data, error } = await supabase
        .from("complaints")
        .update({ status: "resolved" })
        .eq("id", complaintId)
        .single();

    if (error) {
        console.error("[coordinator.resolveComplaint] error:", error);
        throw error;
    }

    return data;
}

export async function escalateComplaint(complaintId) {
    await requireCoordinator();

    const { data, error } = await supabase
        .from("complaints")
        .update({ status: "escalated" })
        .eq("id", complaintId)
        .single();

    if (error) {
        console.error("[coordinator.escalateComplaint] error:", error);
        throw error;
    }

    return data;
}

export async function addCoordinatorComment(complaintId, comment) {
    await requireCoordinator();

    const { error } = await supabase.rpc("coordinator_add_comment", {
        complaint_id: complaintId,
        comment: comment,
    });

    if (error) {
        console.error("[coordinator.addCoordinatorComment] error:", error);
        throw error;
    }

    return true;
}
