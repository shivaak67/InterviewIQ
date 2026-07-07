import type { InterviewSession } from "../../types/interview";
import QuestionWithAnswer from "./QuestionWithAnswer";
import SessionProgress from "./SessionProgress";

type InterviewSessionDetailProps = {
  session: InterviewSession;
};

export default function InterviewSessionDetail({
  session,
}: InterviewSessionDetailProps) {
  return (
    <div>
      <div className="rounded border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-900">{session.resume_filename}</p>
        <p className="mt-2 text-sm text-gray-600">{session.job_description_preview}</p>
        <p className="mt-2 text-xs text-gray-500">
          Created {new Date(session.created_at).toLocaleString()}
        </p>
        <div className="mt-4">
          <SessionProgress
            answerCount={session.answer_count}
            questionCount={session.question_count}
          />
        </div>
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Questions
      </h2>
      <ol className="mt-4 list-decimal space-y-4 pl-5">
        {session.questions.map((question) => (
          <QuestionWithAnswer key={question.id} question={question} />
        ))}
      </ol>
    </div>
  );
}
