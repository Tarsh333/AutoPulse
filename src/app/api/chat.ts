import { apiRequest, apiStream } from "./client";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

// Streams the answer; onDelta receives each incremental chunk of text.
export async function sendChatStream(
  message: string,
  history: ChatMessage[],
  memberId: number | undefined,
  onDelta: (delta: string) => void
): Promise<void> {
  await apiStream(
    "/chat/stream",
    memberId ? { message, history, memberId } : { message, history },
    onDelta
  );
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
