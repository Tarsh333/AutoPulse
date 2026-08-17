import { apiRequest } from "./client";

export interface Profile {
  id: number;
  name: string;
  email: string;
  role: string;
  relationship?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  height?: string | null;
  weight?: string | null;
  blood_group?: string | null;
}

export interface ProfileUpdate {
  dateOfBirth?: string | null;
  gender?: string | null;
  height?: string | null;
  weight?: string | null;
  bloodGroup?: string | null;
}

export function getProfile(): Promise<Profile> {
  return apiRequest<Profile>("/profile");
}

// Backend returns only a message here, so nothing meaningful to return.
export async function updateProfile(update: ProfileUpdate): Promise<void> {
  await apiRequest("/profile", { method: "PUT", body: update });
}
