import { apiRequest } from "./client";

export interface FamilyMember {
  id: number;
  name: string;
  email: string;
  role: string;
  relationship?: string;
  created_at?: string;
}

// MAIN_MEMBER only. Lists the family members the logged-in user added.
export function getMembers(): Promise<FamilyMember[]> {
  return apiRequest<FamilyMember[]>("/members");
}

// MAIN_MEMBER only. Backend requires name, email and relationship.
export function addMember(
  name: string,
  email: string,
  relationship: string
): Promise<FamilyMember> {
  return apiRequest<FamilyMember>("/members", {
    method: "POST",
    body: { name, email, relationship },
  });
}

// MAIN_MEMBER only.
export function deleteMember(id: number): Promise<unknown> {
  return apiRequest(`/members/${id}`, { method: "DELETE" });
}
