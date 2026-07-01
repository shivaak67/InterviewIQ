export type Resume = {
  id: number;
  user_id: number;
  original_filename: string;
  file_path: string;
  extracted_text: string | null;
  created_at: string;
};
