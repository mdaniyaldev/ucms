import { Card, CardContent } from "../ui/card";
import RatingStars from "../ui/RatingStars";
import {
  MessageSquareText,
  Star,
  ThumbsUp,
  BarChart3,
} from "lucide-react";

/**
 * FeedbackStatsCards — renders a grid of feedback stat cards.
 * Reusable for both coordinator and admin dashboards.
 *
 * @param {object} stats - Feedback stats object from RPC
 *   Expected fields (may vary by RPC): total_feedback, average_rating,
 *   satisfaction_percentage, star_5_count, star_4_count, star_3_count,
 *   star_2_count, star_1_count, complaints_without_feedback (admin only)
 * @param {boolean} showDistribution - Whether to show star distribution breakdown
 */
export default function FeedbackStatsCards({
  stats = {},
  showDistribution = true,
}) {
  const avgRating = parseFloat(stats.average_rating || 0).toFixed(1);
  const satisfaction = parseFloat(
    stats.satisfaction_percentage || 0
  ).toFixed(0);

  const mainCards = [
    {
      label: "Total Feedback",
      value: stats.total_feedback || 0,
      icon: MessageSquareText,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      label: "Average Rating",
      value: avgRating,
      suffix: "/ 5",
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      label: "Satisfaction",
      value: `${satisfaction}%`,
      icon: ThumbsUp,
      color:
        satisfaction >= 70
          ? "text-emerald-600"
          : satisfaction >= 40
          ? "text-amber-600"
          : "text-rose-600",
      bgColor:
        satisfaction >= 70
          ? "bg-emerald-50 dark:bg-emerald-950/40"
          : satisfaction >= 40
          ? "bg-amber-50 dark:bg-amber-950/40"
          : "bg-rose-50 dark:bg-rose-950/40",
    },
  ];

  // Star distribution
  const distribution = showDistribution
    ? [
        { stars: 5, count: parseInt(stats.star_5_count || 0), color: "bg-emerald-500" },
        { stars: 4, count: parseInt(stats.star_4_count || 0), color: "bg-green-400" },
        { stars: 3, count: parseInt(stats.star_3_count || 0), color: "bg-amber-400" },
        { stars: 2, count: parseInt(stats.star_2_count || 0), color: "bg-orange-400" },
        { stars: 1, count: parseInt(stats.star_1_count || 0), color: "bg-rose-500" },
      ]
    : [];

  const totalForDistribution = distribution.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-4">
      {/* Main stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {mainCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-3xl font-bold">{stat.value}</span>
                      {stat.suffix && (
                        <span className="text-sm text-slate-500">
                          {stat.suffix}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Star distribution */}
      {showDistribution && totalForDistribution > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Rating Distribution
              </h4>
            </div>
            <div className="space-y-2.5">
              {distribution.map((d) => {
                const pct =
                  totalForDistribution > 0
                    ? Math.round((d.count / totalForDistribution) * 100)
                    : 0;
                return (
                  <div key={d.stars} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 dark:text-slate-400 w-12 shrink-0">
                      {d.stars} star{d.stars !== 1 ? "s" : ""}
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${d.color} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">
                      {d.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
