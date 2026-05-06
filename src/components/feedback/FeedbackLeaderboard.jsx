import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import RatingStars from "../ui/RatingStars";
import { Trophy } from "lucide-react";

/**
 * FeedbackLeaderboard — department ranking table based on feedback.
 *
 * @param {Array} data - Array of leaderboard entries from get_dept_feedback_leaderboard RPC.
 *   Expected fields: department_name, total_feedback, average_rating, satisfaction_percentage
 */
export default function FeedbackLeaderboard({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Department Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400 text-sm">
            No leaderboard data available yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Department Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead>Avg. Rating</TableHead>
              <TableHead>Satisfaction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((dept, index) => {
              const satisfaction = parseFloat(
                dept.satisfaction_percentage || 0
              ).toFixed(0);
              const avgRating = parseFloat(
                dept.average_rating || 0
              ).toFixed(1);

              return (
                <TableRow key={dept.department_name || index}>
                  <TableCell className="font-medium text-slate-500">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {dept.department_name}
                      </span>
                      {parseFloat(satisfaction) >= 80 && (
                        <Badge
                          variant="default"
                          className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0"
                        >
                          High Satisfaction
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{dept.total_feedback || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <RatingStars
                        value={Math.round(parseFloat(avgRating))}
                        readOnly
                        size="sm"
                      />
                      <span className="text-xs text-slate-500">
                        {avgRating}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 max-w-[80px]">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            satisfaction >= 70
                              ? "bg-emerald-500"
                              : satisfaction >= 40
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{
                            width: `${Math.min(satisfaction, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        {satisfaction}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
