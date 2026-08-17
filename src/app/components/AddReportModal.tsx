import { useRef, useState } from "react";
import { X } from "lucide-react";
import { uploadDocument } from "../api/documents";

export default function AddReportModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded?: () => void;
}) {
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose a file");
      return;
    }
    setError("");
    setUploading(true);
    try {
      await uploadDocument(file, category || "lab_report");
      onUploaded?.();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#1F3E72]">Add Report</h3>
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
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 border border-[#2F5D9F] text-[#2F5D9F] rounded-lg hover:bg-[#EAF2FB] transition-colors truncate px-4"
            >
              {file ? file.name : "Choose File (PDF or image)"}
            </button>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3.5 bg-[#2F5D9F] text-white rounded-lg hover:bg-[#1F3E72] transition-colors mt-6 disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
