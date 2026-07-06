import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteJobDescription,
  fetchJobDescriptions,
} from "../../api/jobDescriptions";
import type { ParsedJobData } from "../../types/jobDescription";

function TagList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <div className="mt-1 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full bg-white px-2 py-1 text-xs text-gray-700 ring-1 ring-gray-200"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ParsedDetails({ parsed }: { parsed: ParsedJobData | null }) {
  if (!parsed) {
    return (
      <p className="mt-2 text-sm text-gray-500">No parsed data available.</p>
    );
  }

  return (
    <div>
      <TagList label="Technologies" items={parsed.technologies} />
      <TagList label="Skills" items={parsed.skills} />
      <TagList label="Keywords" items={parsed.keywords} />
      {parsed.responsibilities.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Responsibilities
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-gray-600">
            {parsed.responsibilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function JobDescriptionList() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["job-descriptions"],
    queryFn: fetchJobDescriptions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJobDescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-descriptions"] });
    },
  });

  return (
    <section className="mt-8 rounded border border-gray-200 p-6">
      <h2 className="text-lg font-semibold">Your Job Descriptions</h2>

      {isLoading && (
        <p className="mt-4 text-sm text-gray-500">Loading job descriptions...</p>
      )}
      {isError && (
        <p className="mt-4 text-sm text-red-600">Could not load job descriptions.</p>
      )}

      {deleteMutation.isError && (
        <p className="mt-4 text-sm text-red-600">
          {deleteMutation.error instanceof Error
            ? deleteMutation.error.message
            : "Could not delete job description"}
        </p>
      )}

      {!isLoading && !isError && data?.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">No job descriptions saved yet.</p>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <ul className="mt-4 space-y-3">
          {data.map((job) => (
            <li
              key={job.id}
              className="rounded border border-gray-100 bg-gray-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">
                    Saved {new Date(job.created_at).toLocaleString()}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm text-gray-700">
                    {job.raw_text}
                  </p>
                  <ParsedDetails parsed={job.parsed_json} />
                </div>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(job.id)}
                  disabled={deleteMutation.isPending}
                  className="shrink-0 rounded border border-red-200 px-3 py-1 text-xs text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {deleteMutation.isPending &&
                  deleteMutation.variables === job.id
                    ? "Removing..."
                    : "Remove"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
