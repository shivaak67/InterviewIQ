export type ParsedJobData = {
  skills: string[];
  technologies: string[];
  responsibilities: string[];
  keywords: string[];
};

export type JobDescription = {
  id: number;
  user_id: number;
  raw_text: string;
  parsed_json: ParsedJobData | null;
  created_at: string;
};
