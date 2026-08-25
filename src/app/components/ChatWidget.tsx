import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { sendChat, ChatMessage } from "../api/chat";

export default function ChatWidget({
  memberId,
  subjectName,
}: {
  memberId?: number;
  subjectName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const answer = await sendChat(text, messages, memberId);
      setMessages([...next, { role: "assistant", text: answer }]);
    } catch (err) {
      setMessages([
        ...next,
        { role: "assistant", text: `⚠️ ${(err as Error).message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Summarize my latest report",
    "What medicines am I taking?",
    "Any abnormal results?",
  ];

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#2F5D9F] to-[#1F3E72] text-white shadow-xl shadow-[#2F5D9F]/40 flex items-center justify-center hover:scale-105 active:scale-95 transition"
        aria-label="Open assistant"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-5 z-40 w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-[#2F5D9F] to-[#1F3E72] text-white flex items-center gap-2">
              <Sparkles size={18} />
              <div>
                <p className="font-medium leading-tight">Health Assistant</p>
                <p className="text-white/70 text-xs leading-tight">
                  {subjectName ? `Answers about ${subjectName}` : "Answers from your records"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7FAFF]">
              {messages.length === 0 && (
                <div className="text-center mt-6">
                  <p className="text-slate-500 text-sm mb-3">
                    Ask me anything about {subjectName ? "their" : "your"} records.
                  </p>
                  <div className="flex flex-col gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setInput(s)}
                        className="text-sm text-[#2F5D9F] bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-[#EAF2FB] transition"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-[#2F5D9F] text-white rounded-br-sm"
                        : "bg-white text-[#1F3E72] border border-slate-100 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={send} className="p-3 border-t border-slate-100 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question…"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D9F]/30 focus:border-[#2F5D9F]"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2F5D9F] to-[#1F3E72] text-white flex items-center justify-center disabled:opacity-50 hover:shadow-lg transition"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
