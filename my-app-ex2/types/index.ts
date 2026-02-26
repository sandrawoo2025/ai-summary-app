export interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface UploadResponse {
  success: boolean;
  document?: Document;
  error?: string;
}

export interface SummaryResponse {
  success: boolean;
  summary?: string;
  error?: string;
}
