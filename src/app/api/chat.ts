import { apiRequest } from "./client";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

// Asks the assistant a question; it answers using the user's (or the viewed
// member's) health records. `history` is prior turns for continuity.
export async function sendChat(
  message: string,
  history: ChatMessage[],
  memberId?: number
): Promise<string> {
  const data = await apiRequest<{ answer: string }>("/chat", {
    method: "POST",
    body: memberId ? { message, history, memberId } : { message, history },
  });
  return data.answer;
}
