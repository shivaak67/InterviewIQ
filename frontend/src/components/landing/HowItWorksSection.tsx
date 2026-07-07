const steps = [
  {
    step: "1",
    title: "Upload your resume",
    description: "Add a PDF resume so InterviewIQ understands your skills and projects.",
  },
  {
    step: "2",
    title: "Add a job description",
    description: "Paste the role you are targeting to focus practice on the right requirements.",
  },
  {
    step: "3",
    title: "Generate an interview",
    description: "Get personalized technical, behavioral, and project-specific questions.",
  },
  {
    step: "4",
    title: "Review suggested answers",
    description: "Practice with model answers and STAR breakdowns for behavioral questions.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold">How it works</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
          Four steps from upload to interview-ready.
        </p>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <li
              key={item.step}
              className="rounded border border-gray-200 bg-white p-5"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-medium text-white">
                {item.step}
              </span>
              <h3 className="mt-4 font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
