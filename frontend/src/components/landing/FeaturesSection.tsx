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
    title: "Guidance grounded in your experience",
    description:
      "Build your own answer from coaching outlines and resume excerpts. Fill in the details only you can verify.",
  },
  {
    title: "Session history",
    description:
      "Save drafts, compare attempts, bookmark questions, and practice follow-ups based on your answers.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-2xl font-bold">Practice with a purpose</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
          Prep Pilot turns your background and target role into a focused practice plan.
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
