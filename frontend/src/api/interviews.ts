import type { InterviewSession, InterviewSessionSummary } from "../types/interview";
import { getAuthHeaders, handleResponse } from "./auth";

const API_URL = import.meta.env.VITE_API_URL;

export async function generateInterview(
  resumeId: number,
  jobDescriptionId: number,
): Promise<InterviewSession> {
  const response = await fetch(`${API_URL}/interviews/generate`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      resume_id: resumeId,
      job_description_id: jobDescriptionId,
    }),
  });

  return handleResponse<InterviewSession>(response);
}

export async function fetchInterviewSessions(): Promise<InterviewSessionSummary[]> {
  const response = await fetch(`${API_URL}/interviews/`, {
    headers: getAuthHeaders(),
  });

  return handleResponse<InterviewSessionSummary[]>(response);
}

export async function fetchInterviewSession(
  sessionId: number,
): Promise<InterviewSession> {
  const response = await fetch(`${API_URL}/interviews/${sessionId}`, {
    headers: getAuthHeaders(),
  });

  return handleResponse<InterviewSession>(response);
}

async function handleEmptyResponse(response: Response): Promise<void> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    const message =
      typeof error.detail === "string"
        ? error.detail
        : "Something went wrong";
    throw new Error(message);
  }
}

export async function deleteInterviewSession(sessionId: number): Promise<void> {
  const response = await fetch(`${API_URL}/interviews/${sessionId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleEmptyResponse(response);
}

export async function clearInterviewSessions(): Promise<void> {
  const response = await fetch(`${API_URL}/interviews/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleEmptyResponse(response);
}
