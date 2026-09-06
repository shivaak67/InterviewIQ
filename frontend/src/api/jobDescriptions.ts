import type { JobDescription } from "../types/jobDescription";
import { getAuthHeaders, handleResponse } from "./auth";

const API_URL = import.meta.env.VITE_API_URL;

export async function createJobDescription({rawText, title}: {rawText: string; title: string}): Promise<JobDescription> {
  const response = await fetch(`${API_URL}/job-descriptions/`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw_text: rawText, title }),
  });

  return handleResponse<JobDescription>(response);
}

export async function fetchJobDescriptions(): Promise<JobDescription[]> {
  const response = await fetch(`${API_URL}/job-descriptions/`, {
    headers: getAuthHeaders(),
  });

  return handleResponse<JobDescription[]>(response);
}

export async function deleteJobDescription(jobDescriptionId: number): Promise<void> {
  const response = await fetch(`${API_URL}/job-descriptions/${jobDescriptionId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Delete failed" }));
    const message =
      typeof error.detail === "string"
        ? error.detail
        : "Could not delete job description";
    throw new Error(message);
  }
}

export async function updateJobDescription(id: number, data: {title: string; technologies: string[]; required_skills: string[]; preferred_skills: string[]}): Promise<JobDescription> {
  const response = await fetch(`${API_URL}/job-descriptions/${id}`, {
    method: "PATCH", headers: {...getAuthHeaders(), "Content-Type": "application/json"}, body: JSON.stringify(data),
  });
  return handleResponse<JobDescription>(response);
}
