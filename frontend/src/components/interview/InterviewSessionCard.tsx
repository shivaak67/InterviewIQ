import { Link } from "react-router-dom";
import type { InterviewSessionSummary } from "../../types/interview";
import SessionProgress from "./SessionProgress";

type InterviewSessionCardProps = {
  session: InterviewSessionSummary;
};

export default function InterviewSessionCard({
  session,
}: InterviewSessionCardProps) {
  return (
    <li className="rounded border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-gray-900">
            {session.resume_filename || `Session #${session.id}`}
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {session.job_description_preview}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            {session.question_count} questions ·{" "}
            {new Date(session.created_at).toLocaleString()}
          </p>
          <div className="mt-3">
            <SessionProgress
              answerCount={session.answer_count}
              questionCount={session.question_count}
            />
          </div>
        </div>
        <Link
          to={`/dashboard/sessions/${session.id}`}
          className="shrink-0 rounded bg-black px-3 py-1.5 text-xs text-white transition hover:bg-gray-800"
        >
          Open
        </Link>
      </div>
    </li>
  );
}
