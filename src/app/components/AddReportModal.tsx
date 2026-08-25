import { useRef, useState } from "react";
import { toast } from "sonner";
import ModalShell from "./ModalShell";
import { uploadDocument } from "../api/documents";

export default function AddReportModal({
  memberId,
  onClose,
  onUploaded,
}: {
  memberId?: number;
  onClose: () => void;
  onUploaded?: () => void;
}) {
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose a file");
      return;
    }
    setError("");
    setUploading(true);
    try {
      await uploadDocument(file, category || "lab_report", memberId);
      toast.success("Report uploaded — extracting…");
      onUploaded?.();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ModalShell title="Add Report" onClose={onClose}>
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[#1F3E72] mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-[#D6E4F5] rounded-lg focus:outline-none focus:border-[#2F5D9F] bg-white"
              required
            >
              <option value="">Select category</option>
              <option value="lab_report">Blood Test / Lab Report</option>
              <option value="xray">X-Ray</option>
              <option value="mri">MRI</option>
              <option value="ct_scan">CT Scan</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[#1F3E72] mb-2">Upload File</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-3 border border-[#2F5D9F] text-[#2F5D9F] rounded-lg hover:bg-[#EAF2FB] transition-colors"
              >
                Choose File
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="py-3 border border-[#2F5D9F] text-[#2F5D9F] rounded-lg hover:bg-[#EAF2FB] transition-colors"
              >
                Take Photo
              </button>
            </div>
            {file && (
              <p className="mt-2 text-sm text-[#5C7BA8] truncate">{file.name}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3.5 bg-[#2F5D9F] text-white rounded-lg hover:bg-[#1F3E72] transition-colors mt-6 disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Save"}
          </button>
        </form>
    </ModalShell>
  );
}
