import { useEffect, useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { createShare } from "../api/shares";

export default function ShareQRModal({ onClose }: { onClose: () => void }) {
  const [shareUrl, setShareUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    createShare()
      .then((res) => {
        setShareUrl(`${window.location.origin}/share/${res.token}`);
        setExpiresAt(new Date(res.expires_at).getTime());
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  // Countdown to expiry.
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const secs = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setRemaining(secs);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const expired = expiresAt !== null && remaining === 0;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#1F3E72]">Share Documents</h3>
          <button
            onClick={onClose}
            className="text-[#5C7BA8] hover:text-[#1F3E72]"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center space-y-6">
          {loading ? (
            <p className="text-[#5C7BA8] py-16">Generating secure link...</p>
          ) : expired ? (
            <p className="text-red-600 py-16">
              This link has expired. Close and reopen to generate a new one.
            </p>
          ) : (
            shareUrl && (
              <>
                <p className="text-sm text-[#5C7BA8] text-center">
                  Scan to view my documents. Anyone with this link can access
                  them until it expires.
                </p>

                <div className="p-4 bg-white border-2 border-[#D6E4F5] rounded-xl">
                  <QRCodeCanvas value={shareUrl} size={200} />
                </div>

                <div className="text-center">
                  <p className="text-[#1F3E72]">Expires in</p>
                  <p
                    className="text-[#2F5D9F]"
                    style={{ fontSize: "28px", fontVariantNumeric: "tabular-nums" }}
                  >
                    {mm}:{ss}
                  </p>
                </div>

                <div className="flex gap-2 w-full">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3 py-2 border border-[#D6E4F5] rounded-lg bg-[#EAF2FB] text-[#5C7BA8] text-sm truncate"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-[#2F5D9F] text-white rounded-lg hover:bg-[#1F3E72] transition-colors flex items-center gap-1"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
