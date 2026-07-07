export type GeneratedQuestion = {
  id: number;
  session_id: number;
  question_type: string;
  question_text: string;
  order_index: number;
};

export type InterviewSession = {
  id: number;
  user_id: number;
  resume_id: number;
  job_description_id: number;
  status: string;
  created_at: string;
  question_count: number;
  answer_count: number;
  resume_filename: string;
  job_description_preview: string;
  questions: GeneratedQuestion[];
};

export type InterviewSessionSummary = {
  id: number;
  user_id: number;
  resume_id: number;
  job_description_id: number;
  status: string;
  created_at: string;
  question_count: number;
  answer_count: number;
  resume_filename: string;
  job_description_preview: string;
};
