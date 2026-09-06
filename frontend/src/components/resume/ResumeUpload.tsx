import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type FormEvent } from "react";
import { uploadResume } from "../../api/resumes";
import { formatFileSize, MAX_RESUME_SIZE_BYTES } from "../../utils/fileSize";
import {Link} from "react-router-dom";

export default function ResumeUpload() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const uploadMutation = useMutation({
    mutationFn: uploadResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      clearSelectedFile();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  function clearSelectedFile() {
    setFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(selected: File | null) {
    setError("");

    if (!selected) {
      setFile(null);
      return;
    }

    if (!selected.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (selected.size > MAX_RESUME_SIZE_BYTES) {
      setError(
        `File is ${formatFileSize(selected.size)}. Maximum allowed size is ${formatFileSize(MAX_RESUME_SIZE_BYTES)}.`,
      );
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setFile(selected);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    uploadMutation.mutate(file);
  }

  const fileTooLarge = file !== null && file.size > MAX_RESUME_SIZE_BYTES;

  return (
    <section className="mt-8 rounded border border-gray-200 p-6">
      <h2 className="text-lg font-semibold">Upload Resume</h2>
      <p className="mt-1 text-sm text-gray-600">
        Upload a PDF resume. Max size: {formatFileSize(MAX_RESUME_SIZE_BYTES)}.
      </p>
      <p className="mt-2 text-xs leading-5 text-gray-500">Remove sensitive contact or employer details before uploading. Relevant resume text is sent to AI when you generate practice or feedback. <Link to="/privacy" className="underline">How your data is used</Link></p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-black transition hover:border-gray-400 hover:bg-gray-100">
            Choose file
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </label>

          {file ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-900">{file.name}</span>
              <span className="text-gray-500">({formatFileSize(file.size)})</span>
              <button
                type="button"
                onClick={clearSelectedFile}
                className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 transition hover:bg-gray-100"
              >
                Remove
              </button>
            </div>
          ) : (
            <span className="text-sm text-gray-600">No file chosen</span>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={uploadMutation.isPending || !file || fileTooLarge}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {uploadMutation.isPending ? "Uploading..." : "Upload resume"}
        </button>
      </form>
    </section>
  );
}
