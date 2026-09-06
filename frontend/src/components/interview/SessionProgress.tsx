type SessionProgressProps = {
  answerCount: number;
  questionCount: number;
  practicedCount?: number;
};

export default function SessionProgress({
  answerCount,
  questionCount,
  practicedCount = 0,
}: SessionProgressProps) {
  const percent =
    questionCount > 0 ? Math.min(100, Math.round((practicedCount / questionCount) * 100)) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {practicedCount} of {questionCount} questions practiced
        </span>
        <span>{percent}%</span>
      </div>
      <p className="mt-2 text-xs text-gray-500">{answerCount} answer guides generated · Practice progress counts your attempts.</p>
      <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-200">
        <div
          className="h-1.5 rounded-full bg-black transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
