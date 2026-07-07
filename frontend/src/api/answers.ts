import type { SuggestedAnswer } from "../types/answer";
import { getAuthHeaders, handleResponse } from "./auth";

const API_URL = import.meta.env.VITE_API_URL;

export async function generateSuggestedAnswer(
  questionId: number,
): Promise<SuggestedAnswer> {
  const response = await fetch(`${API_URL}/answers/${questionId}/generate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  return handleResponse<SuggestedAnswer>(response);
}

export async function fetchSuggestedAnswer(
  questionId: number,
): Promise<SuggestedAnswer | null> {
  const response = await fetch(`${API_URL}/answers/${questionId}`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 404) {
    return null;
  }

  return handleResponse<SuggestedAnswer>(response);
}
