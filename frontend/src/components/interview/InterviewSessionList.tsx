import { useQuery } from "@tanstack/react-query";
import { fetchInterviewSessions } from "../../api/interviews";
import InterviewSessionCard from "./InterviewSessionCard";

export default function InterviewSessionList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["interview-sessions"],
    queryFn: fetchInterviewSessions,
  });

  return (
    <section className="rounded border border-gray-200 p-6">
      <h3 className="font-semibold">Past sessions</h3>
      <p className="mt-1 text-sm text-gray-600">
        Pick up where you left off on any previous interview.
      </p>

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
            <InterviewSessionCard key={session.id} session={session} />
          ))}
        </ul>
      )}
    </section>
  );
}
