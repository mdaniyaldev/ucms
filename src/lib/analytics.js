import { supabase, getCurrentUser } from "./supabase";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

function normalizeDays(days = 30) {
  const parsed = Number(days);
  if (!Number.isFinite(parsed) || parsed <= 0) return 30;
  return Math.floor(parsed);
}

function normalizeMonths(months = 6) {
  const parsed = Number(months);
  if (!Number.isFinite(parsed) || parsed <= 0) return 6;
  return Math.floor(parsed);
}

/* ============================
   AI ANALYTICS DASHBOARD
   ADMIN SIDE
   ============================ */

export async function getAIAnalyticsSummary(daysCount = 30) {
  await requireUser();

  const { data, error } = await supabase.rpc("get_ai_analytics_summary", {
    days_count: normalizeDays(daysCount),
  });

  if (error) {
    console.error("[analytics.getAIAnalyticsSummary] error:", error);
    throw error;
  }

  return data?.[0] || {
    total_complaints: 0,
    resolved_complaints: 0,
    pending_complaints: 0,
    escalated_complaints: 0,
    highest_department: "No Data",
    highest_department_count: 0,
    fastest_department: "No Data",
    fastest_avg_resolution_hours: 0,
    overall_avg_resolution_hours: 0,
  };
}

export async function getAIRecurringIssues(daysCount = 30, resultLimit = 5) {
  await requireUser();

  const { data, error } = await supabase.rpc("get_ai_recurring_issues", {
    days_count: normalizeDays(daysCount),
    result_limit: Number(resultLimit) || 5,
  });

  if (error) {
    console.error("[analytics.getAIRecurringIssues] error:", error);
    throw error;
  }

  return data || [];
}

export async function getAIResolutionTimeByDepartment(daysCount = 30) {
  await requireUser();

  const { data, error } = await supabase.rpc(
    "get_ai_resolution_time_by_department",
    {
      days_count: normalizeDays(daysCount),
    }
  );

  if (error) {
    console.error("[analytics.getAIResolutionTimeByDepartment] error:", error);
    throw error;
  }

  return data || [];
}

export async function getAIHourlyDistribution(daysCount = 30) {
  await requireUser();

  const { data, error } = await supabase.rpc("get_ai_hourly_distribution", {
    days_count: normalizeDays(daysCount),
  });

  if (error) {
    console.error("[analytics.getAIHourlyDistribution] error:", error);
    throw error;
  }

  return data || [];
}

export async function getAICategoryTrends(monthsCount = 6) {
  await requireUser();

  const { data, error } = await supabase.rpc("get_ai_category_trends", {
    months_count: normalizeMonths(monthsCount),
  });

  if (error) {
    console.error("[analytics.getAICategoryTrends] error:", error);
    throw error;
  }

  return data || [];
}

export async function getAIPredictedComplaintLoad(daysCount = 30) {
  await requireUser();

  const { data, error } = await supabase.rpc(
    "get_ai_predicted_complaint_load",
    {
      days_count: normalizeDays(daysCount),
    }
  );

  if (error) {
    console.error("[analytics.getAIPredictedComplaintLoad] error:", error);
    throw error;
  }

  return data || [];
}

export async function getAIAnalyticsExport(daysCount = 30) {
  await requireUser();

  const { data, error } = await supabase.rpc("get_ai_analytics_export", {
    days_count: normalizeDays(daysCount),
  });

  if (error) {
    console.error("[analytics.getAIAnalyticsExport] error:", error);
    throw error;
  }

  return data || [];
}

export async function classifyComplaintIssue({ title = "", body = "" } = {}) {
  await requireUser();

  const { data, error } = await supabase.rpc("classify_complaint_issue", {
    p_title: title,
    p_body: body,
  });

  if (error) {
    console.error("[analytics.classifyComplaintIssue] error:", error);
    throw error;
  }

  return data || "Other Recurring Issues";
}

/* ============================
   COMBINED DASHBOARD LOADER
   Use this in AdminAnalytics.jsx
   ============================ */

export async function getAIAnalyticsDashboardData({
  daysCount = 30,
  monthsCount = 6,
  recurringLimit = 5,
} = {}) {
  await requireUser();

  const safeDays = normalizeDays(daysCount);
  const safeMonths = normalizeMonths(monthsCount);

  const [
    summary,
    recurringIssues,
    resolutionTimeByDepartment,
    hourlyDistribution,
    categoryTrends,
    predictedComplaintLoad,
    exportDataset,
  ] = await Promise.all([
    getAIAnalyticsSummary(safeDays),
    getAIRecurringIssues(safeDays, recurringLimit),
    getAIResolutionTimeByDepartment(safeDays),
    getAIHourlyDistribution(safeDays),
    getAICategoryTrends(safeMonths),
    getAIPredictedComplaintLoad(safeDays),
    getAIAnalyticsExport(safeDays),
  ]);

  return {
    summary,
    recurringIssues,
    resolutionTimeByDepartment,
    hourlyDistribution,
    categoryTrends,
    predictedComplaintLoad,
    exportDataset,
  };
}