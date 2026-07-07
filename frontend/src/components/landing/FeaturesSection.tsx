const features = [
  {
    title: "Resume-aware questions",
    description:
      "Interview questions are generated from your actual experience, not generic templates.",
  },
  {
    title: "Job-specific practice",
    description:
      "Paste a job description and practice against the skills and responsibilities it asks for.",
  },
  {
    title: "Model answers with STAR",
    description:
      "Get suggested answers for behavioral questions, structured with Situation, Task, Action, and Result.",
  },
  {
    title: "Session history",
    description:
      "Track past interviews, see your answer progress, and pick up where you left off.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold">Everything you need to prepare</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
          InterviewIQ turns your background and target role into a focused practice plan.
        </p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="rounded border border-gray-200 bg-gray-50 p-5"
            >
              <h3 className="font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
