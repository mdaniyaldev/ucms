import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  BarChart3,
  Loader2,
  AlertCircle,
  Inbox,
  Calendar,
  CheckCircle,
  Lock,
} from "lucide-react";
import {
  listStudentPolls,
  hasVotedPoll,
  castPollVote,
  getPollResults,
} from "../lib/polls";

const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function PollCard({ poll }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [results, setResults] = useState([]);
  const [voting, setVoting] = useState(false);
  const [loadingState, setLoadingState] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const isClosed = poll.status === "closed";

  const loadPollState = useCallback(async () => {
    try {
      setLoadingState(true);
      setError(null);

      const voted = await hasVotedPoll(poll.id);
      setHasVoted(voted);

      // Load results if already voted or poll is closed
      if (voted || isClosed) {
        const res = await getPollResults(poll.id);
        setResults(res);
      }
    } catch (err) {
      console.error("[PollCard] load error:", err);
      setError(err.message || "Failed to load poll state");
    } finally {
      setLoadingState(false);
    }
  }, [poll.id, isClosed]);

  useEffect(() => {
    loadPollState();
  }, [loadPollState]);

  const handleVote = async () => {
    if (!selectedOption) {
      setError("Please select an option");
      return;
    }

    try {
      setVoting(true);
      setError(null);
      await castPollVote({ pollId: poll.id, optionId: selectedOption });
      setHasVoted(true);
      setSuccessMsg("Your vote has been recorded!");

      // Fetch results after voting
      const res = await getPollResults(poll.id);
      setResults(res);

      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error("[PollCard] vote error:", err);
      setError(err.message || "Failed to cast vote");
    } finally {
      setVoting(false);
    }
  };

  // Compute total votes from results
  const totalVotes = results.reduce((sum, r) => sum + (r.vote_count || 0), 0);

  return (
    <Card className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                {poll.title}
              </h3>
              {poll.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {poll.description}
                </p>
              )}
            </div>
            <div className="shrink-0">
              <Badge
                className={
                  isClosed
                    ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-transparent"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-transparent"
                }
              >
                {isClosed ? "Closed" : "Active"}
              </Badge>
            </div>
          </div>

          {/* Dates */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
            {poll.starts_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Starts: {formatDate(poll.starts_at)}</span>
              </div>
            )}
            {poll.ends_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Ends: {formatDate(poll.ends_at)}</span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Success */}
          {successMsg && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-green-800 dark:text-green-200 text-sm">{successMsg}</p>
            </div>
          )}

          {loadingState ? (
            <div className="flex items-center gap-2 py-4 text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading poll...
            </div>
          ) : hasVoted || isClosed ? (
            /* Results view */
            <div className="space-y-3">
              {hasVoted && (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>You have already voted</span>
                </div>
              )}

              <div className="space-y-2">
                {results.map((result) => {
                  const pct = result.percentage != null ? Number(result.percentage) : 0;
                  return (
                    <div key={result.option_id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700 dark:text-slate-200 font-medium">
                          {result.option_text}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs">
                          {result.vote_count || 0} vote{result.vote_count !== 1 ? "s" : ""} ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">
                Total votes: {totalVotes}
              </p>
            </div>
          ) : (
            /* Voting view */
            <div className="space-y-3">
              <div className="space-y-2">
                {(poll.poll_options || []).map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedOption === option.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-400"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`poll-${poll.id}`}
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={() => setSelectedOption(option.id)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      {option.option_text}
                    </span>
                  </label>
                ))}
              </div>

              <Button
                onClick={handleVote}
                disabled={voting || !selectedOption}
                size="sm"
                className="gap-2"
              >
                {voting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BarChart3 className="w-4 h-4" />
                )}
                {voting ? "Submitting..." : "Cast Vote"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function StudentPolls() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  async function fetchPolls() {
    try {
      setLoading(true);
      setError(null);
      const data = await listStudentPolls();
      setPolls(data);
    } catch (err) {
      console.error("[StudentPolls] fetch error:", err);
      setError(err.message || "Failed to load polls");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-blue-500" />
          Polls
        </h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">
          Participate in university polls and see the results.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading polls…
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-rose-500 gap-3">
          <AlertCircle className="w-12 h-12" />
          <p className="font-medium">{error}</p>
          <button
            onClick={fetchPolls}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Retry
          </button>
        </div>
      ) : polls.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Inbox className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                No polls available
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                There are no active polls at the moment. Check back later!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}
