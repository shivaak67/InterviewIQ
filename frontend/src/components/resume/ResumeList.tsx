import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteResume, fetchResumes } from "../../api/resumes";

export default function ResumeList() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["resumes"],
    queryFn: fetchResumes,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });

  return (
    <section className="mt-8 rounded border border-gray-200 p-6">
      <h2 className="text-lg font-semibold">Your Resumes</h2>

      {isLoading && <p className="mt-4 text-sm text-gray-500">Loading resumes...</p>}
      {isError && (
        <p className="mt-4 text-sm text-red-600">Could not load resumes.</p>
      )}

      {deleteMutation.isError && (
        <p className="mt-4 text-sm text-red-600">
          {deleteMutation.error instanceof Error
            ? deleteMutation.error.message
            : "Could not delete resume"}
        </p>
      )}

      {!isLoading && !isError && data?.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">No resumes uploaded yet.</p>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <ul className="mt-4 space-y-3">
          {data.map((resume) => (
            <li
              key={resume.id}
              className="rounded border border-gray-100 bg-gray-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">{resume.original_filename}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Uploaded {new Date(resume.created_at).toLocaleString()}
                  </p>
                  {resume.extracted_text && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {resume.extracted_text}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(resume.id)}
                  disabled={deleteMutation.isPending}
                  className="shrink-0 rounded border border-red-200 px-3 py-1 text-xs text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {deleteMutation.isPending &&
                  deleteMutation.variables === resume.id
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
