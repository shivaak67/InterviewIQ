import type { InterviewSession } from "../../types/interview";
import QuestionWithAnswer from "./QuestionWithAnswer";

type InterviewSessionDetailProps = {
  session: InterviewSession;
};

export default function InterviewSessionDetail({
  session,
}: InterviewSessionDetailProps) {
  return (
    <div>
      <div className="rounded border border-gray-100 bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-900">{session.resume_filename}</p>
        <p className="mt-2 text-sm text-gray-600">{session.job_description_preview}</p>
        <p className="mt-3 text-xs text-gray-500">
          {session.answer_count} of {session.question_count} answers prepared ·{" "}
          {new Date(session.created_at).toLocaleString()}
        </p>
      </div>

      <ol className="mt-6 list-decimal space-y-4 pl-5">
        {session.questions.map((question) => (
          <QuestionWithAnswer key={question.id} question={question} />
        ))}
      </ol>
    </div>
  );
}
