import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { createJobDescription } from "../../api/jobDescriptions";

const MIN_LENGTH = 50;
const MAX_LENGTH = 20000;

export default function JobDescriptionForm() {
  const queryClient = useQueryClient();
  const [rawText, setRawText] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: createJobDescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-descriptions"] });
      setRawText("");
      setTitle("");
      setError("");
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmed = rawText.trim();
    if (trimmed.length < MIN_LENGTH) {
      setError(`Job description must be at least ${MIN_LENGTH} characters`);
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(`Job description must be ${MAX_LENGTH} characters or fewer`);
      return;
    }

    createMutation.mutate({rawText: trimmed, title});
  }

  return (
    <section className="mt-8 rounded border border-gray-200 p-6">
      <h2 className="text-lg font-semibold">Add Job Description</h2>
      <p className="mt-1 text-sm text-gray-600">
        Paste a job posting to extract skills, technologies, and responsibilities.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div><label htmlFor="job-title" className="block text-sm font-medium">Company and role</label>
          <input id="job-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={160} placeholder="Pylon — Software Engineer Intern" className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" /></div>
        <div>
          <label htmlFor="job-description" className="block text-sm font-medium">
            Job description
          </label>
          <textarea
            id="job-description"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={8}
            maxLength={MAX_LENGTH}
            placeholder="Paste the full job description here..."
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            {rawText.trim().length} / {MAX_LENGTH} characters (min {MIN_LENGTH})
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={createMutation.isPending || rawText.trim().length < MIN_LENGTH}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {createMutation.isPending ? "Analyzing..." : "Save & analyze"}
        </button>
      </form>
    </section>
  );
}
