import type { Resume } from "../types/resume";
import { getAuthHeaders, handleResponse } from "./auth";

const API_URL = import.meta.env.VITE_API_URL;

export async function uploadResume(file: File): Promise<Resume> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/resumes/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  return handleResponse<Resume>(response);
}

export async function fetchResumes(): Promise<Resume[]> {
  const response = await fetch(`${API_URL}/resumes/`, {
    headers: getAuthHeaders(),
  });

  return handleResponse<Resume[]>(response);
}
