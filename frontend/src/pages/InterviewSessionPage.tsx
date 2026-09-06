import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { fetchInterviewSession } from "../api/interviews";
import InterviewSessionDetail from "../components/interview/InterviewSessionDetail";

export default function InterviewSessionPage() {
  const { sessionId } = useParams();
  const parsedSessionId = Number(sessionId);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["interview-session", parsedSessionId],
    queryFn: () => fetchInterviewSession(parsedSessionId),
    enabled: Number.isInteger(parsedSessionId) && parsedSessionId > 0,
  });

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <Link
        to="/dashboard"
        className="text-sm text-gray-600 underline hover:text-black"
      >
        Back to dashboard
      </Link>

      <h1 className="mt-4 text-2xl font-bold">Interview session</h1>

      {!Number.isInteger(parsedSessionId) || parsedSessionId <= 0 ? (
        <p className="mt-4 text-sm text-red-600">Invalid session link.</p>
      ) : isLoading ? (
        <p className="mt-4 text-sm text-gray-500">Loading session...</p>
      ) : isError || !data ? (
        <p className="mt-4 text-sm text-red-600">Could not load this session.</p>
      ) : (
        <div className="mt-6">
          <InterviewSessionDetail key={data.id} session={data} />
        </div>
      )}
    </main>
  );
}
