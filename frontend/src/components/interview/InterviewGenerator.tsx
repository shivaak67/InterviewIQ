import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { fetchJobDescriptions } from "../../api/jobDescriptions";
import { generateInterview } from "../../api/interviews";
import { fetchResumes } from "../../api/resumes";
import type { InterviewSession } from "../../types/interview";
import InterviewSessionDetail from "./InterviewSessionDetail";

export default function InterviewGenerator() {
  const queryClient = useQueryClient();
  const [resumeId, setResumeId] = useState("");
  const [jobDescriptionId, setJobDescriptionId] = useState("");
  const [error, setError] = useState("");
  const [latestSession, setLatestSession] = useState<InterviewSession | null>(null);

  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: ["resumes"],
    queryFn: fetchResumes,
  });

  const { data: jobDescriptions, isLoading: jobsLoading } = useQuery({
    queryKey: ["job-descriptions"],
    queryFn: fetchJobDescriptions,
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      generateInterview(Number(resumeId), Number(jobDescriptionId)),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["interview-sessions"] });
      setLatestSession(session);
      setError("");
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLatestSession(null);

    if (!resumeId || !jobDescriptionId) {
      setError("Please select both a resume and a job description");
      return;
    }

    generateMutation.mutate();
  }

  const hasResumes = (resumes?.length ?? 0) > 0;
  const hasJobDescriptions = (jobDescriptions?.length ?? 0) > 0;

  return (
    <section className="mt-8 rounded border border-gray-200 p-6">
      <h2 className="text-lg font-semibold">Generate Interview</h2>
      <p className="mt-1 text-sm text-gray-600">
        Choose a resume and job description to generate personalized questions.
      </p>

      {!hasResumes || !hasJobDescriptions ? (
        <p className="mt-4 text-sm text-amber-700">
          Upload at least one resume and save one job description before generating
          an interview.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="resume-select" className="block text-sm font-medium">
              Resume
            </label>
            <select
              id="resume-select"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              disabled={resumesLoading || generateMutation.isPending}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select a resume</option>
              {resumes?.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.original_filename}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="job-select" className="block text-sm font-medium">
              Job description
            </label>
            <select
              id="job-select"
              value={jobDescriptionId}
              onChange={(e) => setJobDescriptionId(e.target.value)}
              disabled={jobsLoading || generateMutation.isPending}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select a job description</option>
              {jobDescriptions?.map((job, index) => (
                <option key={job.id} value={job.id}>
                  Job description #{jobDescriptions.length - index} —{" "}
                  {new Date(job.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={
              generateMutation.isPending || !resumeId || !jobDescriptionId
            }
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {generateMutation.isPending ? "Generating..." : "Generate interview"}
          </button>
        </form>
      )}

      {latestSession && (
        <div className="mt-6 rounded border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-medium">Generated questions</h3>
            <Link
              to={`/dashboard/sessions/${latestSession.id}`}
              className="text-xs underline"
            >
              Open full session
            </Link>
          </div>
          <InterviewSessionDetail session={latestSession} />
        </div>
      )}
    </section>
  );
}
