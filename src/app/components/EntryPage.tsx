import { Activity } from "lucide-react";

export default function EntryPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAF2FB] via-white to-[#D6E4F5] flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-8">
        <div className="flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#2F5D9F] to-[#1F3E72] flex items-center justify-center shadow-xl shadow-[#2F5D9F]/30">
            <Activity className="text-white" size={40} strokeWidth={2.5} />
          </div>
          <h1
            className="bg-gradient-to-r from-[#2F5D9F] to-[#1F3E72] bg-clip-text text-transparent tracking-tight"
            style={{ fontSize: "48px", fontWeight: 700 }}
          >
            AutoPulse
          </h1>
          <p className="text-[#5C7BA8] max-w-sm">
            Your family's medical records — organized, understood, and always
            with you.
          </p>
        </div>

        <button
          onClick={onGetStarted}
          className="px-12 py-3.5 bg-gradient-to-r from-[#2F5D9F] to-[#1F3E72] text-white rounded-xl shadow-lg shadow-[#2F5D9F]/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
