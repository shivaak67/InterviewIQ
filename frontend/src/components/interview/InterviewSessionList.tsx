import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchInterviewSessions } from "../../api/interviews";

export default function InterviewSessionList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["interview-sessions"],
    queryFn: fetchInterviewSessions,
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
          {data.map((session) => (
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
                <Link
                  to={`/dashboard/sessions/${session.id}`}
                  className="shrink-0 rounded border border-gray-300 px-3 py-1 text-xs transition hover:bg-white"
                >
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
