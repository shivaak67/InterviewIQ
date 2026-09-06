import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { rerollInterviewSession } from "../../api/interviews";
import type { InterviewSession } from "../../types/interview";
import QuestionWithAnswer from "./QuestionWithAnswer";
import SessionProgress from "./SessionProgress";

type InterviewSessionDetailProps = {
  session: InterviewSession;
};

export default function InterviewSessionDetail({
  session,
}: InterviewSessionDetailProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const rerollMutation = useMutation({
    mutationFn: () => rerollInterviewSession(session.id),
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(["interview-session", updatedSession.id], updatedSession);
      queryClient.invalidateQueries({ queryKey: ["interview-sessions"] });
      navigate(`/dashboard/sessions/${updatedSession.id}`);
    },
  });

  function handleReroll() {
    const confirmed = window.confirm(
      "Create another session with fresh questions? Your saved practice history will be kept. Save any unsaved drafts before continuing.",
    );
    if (!confirmed) {
      return;
    }
    rerollMutation.mutate();
  }

  return (
    <div>
      <div className="rounded border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-900">{session.resume_filename}</p>
        <p className="mt-2 text-sm text-gray-600">{session.job_description_preview}</p>
        <p className="mt-2 text-xs capitalize text-indigo-700">{session.difficulty || "intermediate"} · {(session.interview_type || "mixed").replaceAll("_", " ")}</p>
        <p className="mt-2 text-xs text-gray-500">
          Created {new Date(session.created_at).toLocaleString()}
        </p>
        <div className="mt-4">
          <SessionProgress
            answerCount={session.answer_count}
            questionCount={session.question_count}
            practicedCount={session.practiced_count}
          />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Questions
        </h2>
        <button
          type="button"
          onClick={handleReroll}
          disabled={rerollMutation.isPending}
          className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs transition hover:bg-gray-50 disabled:opacity-50"
        >
          {rerollMutation.isPending ? "Creating new session..." : "Practice fresh questions"}
        </button>
      </div>

      {rerollMutation.isError && (
        <p className="mt-3 text-sm text-red-600">
          {rerollMutation.error instanceof Error
            ? rerollMutation.error.message
            : "Could not reroll questions"}
        </p>
      )}

      <ol className="mt-4 list-decimal space-y-10 pl-5">
        {session.questions.map((question) => (
          <QuestionWithAnswer key={question.id} question={question} />
        ))}
      </ol>
    </div>
  );
}
