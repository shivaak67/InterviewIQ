import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSuggestedAnswer,
  generateSuggestedAnswer,
} from "../../api/answers";
import type { GeneratedQuestion } from "../../types/interview";
import type { SuggestedAnswer } from "../../types/answer";
import PracticePanel from "./PracticePanel";

function formatQuestionType(type: string): string {
  return type.replaceAll("_", " ");
}

function hasStarBreakdown(answer: SuggestedAnswer): boolean {
  return Boolean(
    answer.star_situation ||
      answer.star_task ||
      answer.star_action ||
      answer.star_result,
  );
}

function SuggestedAnswerPanel({ questionId }: { questionId: number }) {
  const queryClient = useQueryClient();

  const { data: answer, isLoading } = useQuery({
    queryKey: ["suggested-answer", questionId],
    queryFn: () => fetchSuggestedAnswer(questionId),
  });

  const generateMutation = useMutation({
    mutationFn: () => generateSuggestedAnswer(questionId),
    onSuccess: (generated) => {
      queryClient.setQueryData(["suggested-answer", questionId], generated);
      queryClient.invalidateQueries({ queryKey: ["interview-session"] });
      queryClient.invalidateQueries({ queryKey: ["interview-sessions"] });
    },
  });

  if (isLoading) {
    return (
      <p className="mt-2 text-xs text-gray-500">Checking for saved answer...</p>
    );
  }

  if (!answer) {
    return (
      <div className="mt-3">
        <button
          type="button"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="rounded border border-gray-300 px-3 py-1 text-xs transition hover:bg-white disabled:opacity-50"
        >
          {generateMutation.isPending ? "Building outline..." : "Get answer guidance"}
        </button>
        {generateMutation.isError && (
          <p className="mt-2 text-xs text-red-600">
            {generateMutation.error.message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded border border-gray-200 bg-white p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        Answer guidance
      </p>
      <p className="mt-2 text-xs text-amber-800">Use only your real experience. Older saved examples may contain assumptions; verify every personal claim before using them.</p>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-800">{answer.answer_text}</p>

      {hasStarBreakdown(answer) && (
        <dl className="mt-3 space-y-2 border-t border-gray-100 pt-3">
          {answer.star_situation && (
            <div>
              <dt className="text-xs font-medium text-gray-500">Situation</dt>
              <dd className="mt-0.5 text-sm text-gray-700">{answer.star_situation}</dd>
            </div>
          )}
          {answer.star_task && (
            <div>
              <dt className="text-xs font-medium text-gray-500">Task</dt>
              <dd className="mt-0.5 text-sm text-gray-700">{answer.star_task}</dd>
            </div>
          )}
          {answer.star_action && (
            <div>
              <dt className="text-xs font-medium text-gray-500">Action</dt>
              <dd className="mt-0.5 text-sm text-gray-700">{answer.star_action}</dd>
            </div>
          )}
          {answer.star_result && (
            <div>
              <dt className="text-xs font-medium text-gray-500">Result</dt>
              <dd className="mt-0.5 text-sm text-gray-700">{answer.star_result}</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}

type QuestionWithAnswerProps = {
  question: GeneratedQuestion;
};

export default function QuestionWithAnswer({ question }: QuestionWithAnswerProps) {
  return (
    <li className="text-sm text-gray-700">
      <span className="font-medium capitalize text-gray-900">
        {formatQuestionType(question.question_type)}
      </span>
      <p className="mt-1">{question.question_text}</p>
      <PracticePanel question={question} />
      <details className="mt-4 rounded-lg border border-gray-200 p-4"><summary className="cursor-pointer text-sm font-medium">Need a starting point? Open answer guidance</summary><SuggestedAnswerPanel questionId={question.id} /></details>
    </li>
  );
}
