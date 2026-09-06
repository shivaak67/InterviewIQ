import {getAuthHeaders, handleResponse} from './auth';
export type Feedback = {relevance: number; specificity: number; structure: number; technical_depth: number; strengths: string[]; improvements: string[]; next_step: string; follow_up: string};
export type Attempt = {id: number; question_id: number; answer_text: string; prompt_text: string; feedback_json: Feedback; created_at: string};
const API_URL = import.meta.env.VITE_API_URL;
export async function fetchAttempts(id: number): Promise<Attempt[]> {
  return handleResponse(await fetch(`${API_URL}/answers/${id}/attempts`, {headers: getAuthHeaders()}));
}
export async function submitAttempt(id: number, answer_text: string, follow_up_from?: number): Promise<Attempt> {
  return handleResponse(await fetch(`${API_URL}/answers/${id}/attempts`, {method: 'POST', headers: {...getAuthHeaders(), 'Content-Type': 'application/json'}, body: JSON.stringify({answer_text, follow_up_from})}));
}
export async function saveDraft(id: number, draft_text: string, bookmarked: boolean) {
  return handleResponse(await fetch(`${API_URL}/answers/${id}/practice`, {method: 'PATCH', headers: {...getAuthHeaders(), 'Content-Type': 'application/json'}, body: JSON.stringify({draft_text, bookmarked})}));
}
