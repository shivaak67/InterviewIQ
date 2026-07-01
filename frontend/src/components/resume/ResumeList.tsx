import { useQuery } from "@tanstack/react-query";
import { fetchResumes } from "../../api/resumes";

export default function ResumeList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["resumes"],
    queryFn: fetchResumes,
  });

  return (
    <section className="mt-8 rounded border border-gray-200 p-6">
      <h2 className="text-lg font-semibold">Your Resumes</h2>

      {isLoading && <p className="mt-4 text-sm text-gray-500">Loading resumes...</p>}
      {isError && (
        <p className="mt-4 text-sm text-red-600">Could not load resumes.</p>
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
              <p className="font-medium">{resume.original_filename}</p>
              <p className="mt-1 text-xs text-gray-500">
                Uploaded {new Date(resume.created_at).toLocaleString()}
              </p>
              {resume.extracted_text && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {resume.extracted_text}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
