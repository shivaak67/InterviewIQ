import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { uploadResume } from "../../api/resumes";

export default function ResumeUpload() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const uploadMutation = useMutation({
    mutationFn: uploadResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      setFile(null);
      setError("");
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    uploadMutation.mutate(file);
  }

  return (
    <section className="mt-8 rounded border border-gray-200 p-6">
      <h2 className="text-lg font-semibold">Upload Resume</h2>
      <p className="mt-1 text-sm text-gray-600">
        Upload a PDF resume. Max size: 5 MB.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={uploadMutation.isPending || !file}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {uploadMutation.isPending ? "Uploading..." : "Upload resume"}
        </button>
      </form>
    </section>
  );
}
