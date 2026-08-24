import { useEffect, useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { createShare } from "../api/shares";
import { DocumentItem } from "../api/documents";

export default function ShareQRModal({
  documents,
  onClose,
}: {
  documents: DocumentItem[];
  onClose: () => void;
}) {
  // Step 1: pick documents. Step 2: show the QR.
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [shareUrl, setShareUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (selected.size === 0) {
      setError("Select at least one document");
      return;
    }
    setError("");
    setCreating(true);
    try {
      const res = await createShare([...selected]);
      setShareUrl(`${window.location.origin}/share/${res.token}`);
      setExpiresAt(new Date(res.expires_at).getTime());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  // Countdown to expiry (only once a link exists).
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () =>
      setRemaining(Math.max(0, Math.round((expiresAt - Date.now()) / 1000)));
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

  const showQr = shareUrl && !expired;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
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

        {/* Step 2 — the QR */}
        {showQr ? (
          <div className="flex flex-col items-center space-y-6">
            <p className="text-sm text-[#5C7BA8] text-center">
              Scan to view the {selected.size} shared document
              {selected.size > 1 ? "s" : ""}. Anyone with this link can access
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
          </div>
        ) : expired ? (
          <p className="text-red-600 py-16 text-center">
            This link has expired. Close and reopen to generate a new one.
          </p>
        ) : (
          /* Step 1 — pick documents */
          <div className="space-y-4">
            <p className="text-sm text-[#5C7BA8]">
              Select the documents you want to share.
            </p>

            {documents.length === 0 ? (
              <p className="text-[#5C7BA8]">
                You have no documents to share yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {documents.map((doc) => (
                  <label
                    key={doc.id}
                    className="flex items-center gap-3 p-3 border border-[#D6E4F5] rounded-lg cursor-pointer hover:bg-[#EAF2FB]"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(doc.id)}
                      onChange={() => toggle(doc.id)}
                      className="w-4 h-4 accent-[#2F5D9F]"
                    />
                    <div className="min-w-0">
                      <p className="text-[#1F3E72] truncate">{doc.file_name}</p>
                      <p className="text-xs text-[#5C7BA8]">
                        {new Date(doc.created_at).toLocaleDateString()}
                        {doc.category ? ` · ${doc.category}` : ""}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={creating || selected.size === 0}
              className="w-full py-3 bg-[#2F5D9F] text-white rounded-lg hover:bg-[#1F3E72] transition-colors disabled:opacity-60"
            >
              {creating
                ? "Generating..."
                : `Generate QR (${selected.size} selected)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
