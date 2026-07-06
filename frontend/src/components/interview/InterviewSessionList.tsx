import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  fetchInterviewSession,
  fetchInterviewSessions,
} from "../../api/interviews";

function formatQuestionType(type: string): string {
  return type.replaceAll("_", " ");
}

export default function InterviewSessionList() {
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["interview-sessions"],
    queryFn: fetchInterviewSessions,
  });

  const {
    data: expandedSession,
    isLoading: sessionLoading,
    isError: sessionError,
  } = useQuery({
    queryKey: ["interview-session", expandedSessionId],
    queryFn: () => fetchInterviewSession(expandedSessionId!),
    enabled: expandedSessionId !== null,
  });

  return (
    <section className="mt-8 rounded border border-gray-200 p-6">
      <h2 className="text-lg font-semibold">Interview History</h2>

      {isLoading && (
        <p className="mt-4 text-sm text-gray-500">Loading interview sessions...</p>
      )}
      {isError && (
        <p className="mt-4 text-sm text-red-600">Could not load interview sessions.</p>
      )}

      {!isLoading && !isError && data?.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">No interviews generated yet.</p>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <ul className="mt-4 space-y-3">
          {data.map((session) => {
            const isExpanded = expandedSessionId === session.id;

            return (
              <li
                key={session.id}
                className="rounded border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">Interview session #{session.id}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {session.question_count} questions ·{" "}
                      {new Date(session.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSessionId(isExpanded ? null : session.id)
                    }
                    className="shrink-0 rounded border border-gray-300 px-3 py-1 text-xs transition hover:bg-white"
                  >
                    {isExpanded ? "Hide" : "View"}
                  </button>
                </div>

                {isExpanded && sessionLoading && (
                  <p className="mt-4 text-sm text-gray-500">Loading questions...</p>
                )}
                {isExpanded && sessionError && (
                  <p className="mt-4 text-sm text-red-600">
                    Could not load questions.
                  </p>
                )}
                {isExpanded && expandedSession && (
                  <ol className="mt-4 list-decimal space-y-3 pl-5">
                    {expandedSession.questions.map((question) => (
                      <li key={question.id} className="text-sm text-gray-700">
                        <span className="font-medium capitalize text-gray-900">
                          {formatQuestionType(question.question_type)}
                        </span>
                        <p className="mt-1">{question.question_text}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
