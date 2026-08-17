import { apiRequest } from "./client";

export interface ExtractedMedicine {
  name: string;
  strength: string;
  dose: string;
  frequency: string;
  duration: string;
}

export interface ExtractedMetric {
  name: string;
  value: number;
  unit: string;
  reference_range: string;
}

export interface ExtractedData {
  document_type: "prescription" | "lab_report" | "unknown";
  medicines?: ExtractedMedicine[];
  metrics?: ExtractedMetric[];
}

export type ExtractionStatus =
  | "pending"
  | "processing"
  | "done"
  | "failed"
  | "skipped";

export interface DocumentItem {
  id: number;
  category: string | null;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  document_type: string | null;
  extracted_data: ExtractedData | null;
  extraction_status: ExtractionStatus;
  extraction_error: string | null;
  created_at: string;
}

export function getDocuments(): Promise<DocumentItem[]> {
  return apiRequest<DocumentItem[]>("/documents");
}

export function getDocument(id: number): Promise<DocumentItem> {
  return apiRequest<DocumentItem>(`/documents/${id}`);
}

export function uploadDocument(
  file: File,
  category?: string
): Promise<DocumentItem> {
  const form = new FormData();
  form.append("file", file);
  if (category) {
    form.append("category", category);
  }
  return apiRequest<DocumentItem>("/documents", {
    method: "POST",
    body: form,
  });
}

interface DownloadInfo {
  file_name: string;
  url: string;
  expires_in: number;
}

export function getDownloadUrl(id: number): Promise<DownloadInfo> {
  return apiRequest<DownloadInfo>(`/documents/${id}/download`);
}

export function reExtractDocument(id: number): Promise<unknown> {
  return apiRequest(`/documents/${id}/extract`, { method: "POST" });
}

export function deleteDocument(id: number): Promise<unknown> {
  return apiRequest(`/documents/${id}`, { method: "DELETE" });
}
