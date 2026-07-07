export type SuggestedAnswer = {
  id: number;
  question_id: number;
  answer_text: string;
  star_situation: string | null;
  star_task: string | null;
  star_action: string | null;
  star_result: string | null;
  created_at: string;
};
