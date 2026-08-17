import { apiRequest } from "./client";
import { DocumentItem } from "./documents";

interface CreateShareResult {
  token: string;
  expires_at: string;
  ttl_seconds: number;
}

// Requires auth — creates a 30-minute share token for my documents.
export function createShare(): Promise<CreateShareResult> {
  return apiRequest<CreateShareResult>("/shares", { method: "POST" });
}

// Documents come back without storage_path/error fields, but the shared subset
// matches DocumentItem closely enough for display.
export type SharedDocument = Pick<
  DocumentItem,
  | "id"
  | "category"
  | "file_name"
  | "mime_type"
  | "document_type"
  | "extracted_data"
  | "extraction_status"
  | "created_at"
>;

interface ShareView {
  owner_name: string | null;
  expires_at: string;
  documents: SharedDocument[];
}

// Public — no auth token needed.
export function getShare(token: string): Promise<ShareView> {
  return apiRequest<ShareView>(`/shares/${token}`, { auth: false });
}

export function getSharedDownloadUrl(
  token: string,
  id: number
): Promise<{ file_name: string; url: string }> {
  return apiRequest(`/shares/${token}/documents/${id}/download`, {
    auth: false,
  });
}
