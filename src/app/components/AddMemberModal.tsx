import { useState } from "react";
import ModalShell from "./ModalShell";

interface MemberData {
  name: string;
  email: string;
  relationship: string;
}

export default function AddMemberModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: MemberData) => Promise<void> | void;
}) {
  const [formData, setFormData] = useState<MemberData>({
    name: "",
    email: "",
    relationship: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave(formData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F5D9F]/30 focus:border-[#2F5D9F] bg-white transition";

  return (
    <ModalShell title="Add Family Member" onClose={onClose} maxWidth="max-w-lg">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[#1F3E72] mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={inputClass}
              placeholder="Enter name"
              required
            />
          </div>

          <div>
            <label className="block text-[#1F3E72] mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={inputClass}
              placeholder="Enter email (used for OTP login)"
              required
            />
          </div>

          <div>
            <label className="block text-[#1F3E72] mb-2">Relationship</label>
            <select
              value={formData.relationship}
              onChange={(e) =>
                setFormData({ ...formData, relationship: e.target.value })
              }
              className={inputClass}
              required
            >
              <option value="">Select</option>
              <option value="spouse">Spouse</option>
              <option value="child">Child</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-[#D6E4F5] text-[#1F3E72] rounded-xl hover:bg-[#EAF2FB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-[#2F5D9F] text-white rounded-xl hover:bg-[#1F3E72] transition-colors shadow-[0_4px_14px_rgb(47,93,159,0.25)] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
    </ModalShell>
  );
}
