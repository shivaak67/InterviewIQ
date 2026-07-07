type SessionProgressProps = {
  answerCount: number;
  questionCount: number;
};

export default function SessionProgress({
  answerCount,
  questionCount,
}: SessionProgressProps) {
  const percent =
    questionCount > 0 ? Math.round((answerCount / questionCount) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {answerCount} of {questionCount} answers prepared
        </span>
        <span>{percent}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-200">
        <div
          className="h-1.5 rounded-full bg-black transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
