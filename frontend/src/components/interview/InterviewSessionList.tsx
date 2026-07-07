import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clearInterviewSessions,
  deleteInterviewSession,
  fetchInterviewSessions,
} from "../../api/interviews";
import InterviewSessionCard from "./InterviewSessionCard";

export default function InterviewSessionList() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["interview-sessions"],
    queryFn: fetchInterviewSessions,
  });

  const clearMutation = useMutation({
    mutationFn: clearInterviewSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interview-sessions"] });
      queryClient.removeQueries({ queryKey: ["interview-session"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInterviewSession,
    onSuccess: (_data, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["interview-sessions"] });
      queryClient.removeQueries({ queryKey: ["interview-session", sessionId] });
    },
  });

  function handleClearHistory() {
    const confirmed = window.confirm(
      "Clear all past interview sessions? This cannot be undone.",
    );
    if (!confirmed) {
      return;
    }
    clearMutation.mutate();
  }

  const hasSessions = (data?.length ?? 0) > 0;

  return (
    <section className="rounded border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">Past sessions</h3>
          <p className="mt-1 text-sm text-gray-600">
            Pick up where you left off on any previous interview.
          </p>
        </div>
        {hasSessions && (
          <button
            type="button"
            onClick={handleClearHistory}
            disabled={clearMutation.isPending}
            className="shrink-0 rounded border border-red-300 px-3 py-1.5 text-xs text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            {clearMutation.isPending ? "Clearing..." : "Clear history"}
          </button>
        )}
      </div>

      {clearMutation.isError && (
        <p className="mt-4 text-sm text-red-600">
          {clearMutation.error instanceof Error
            ? clearMutation.error.message
            : "Could not clear interview history"}
        </p>
      )}
      {deleteMutation.isError && (
        <p className="mt-4 text-sm text-red-600">
          {deleteMutation.error instanceof Error
            ? deleteMutation.error.message
            : "Could not delete interview session"}
        </p>
      )}

      {isLoading && (
        <p className="mt-4 text-sm text-gray-500">Loading interview sessions...</p>
      )}
      {isError && (
        <p className="mt-4 text-sm text-red-600">Could not load interview sessions.</p>
      )}

      {!isLoading && !isError && data?.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">
          No interviews yet. Generate your first session above.
        </p>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <ul className="mt-4 space-y-3">
          {data.map((session) => (
            <InterviewSessionCard
              key={session.id}
              session={session}
              onDelete={(sessionId) => deleteMutation.mutate(sessionId)}
              isDeleting={deleteMutation.isPending}
              deletingSessionId={deleteMutation.variables ?? null}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
