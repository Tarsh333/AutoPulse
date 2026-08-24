import { useState } from "react";
import { X } from "lucide-react";
import { updateProfile, Profile } from "../api/profile";

export default function EditProfileModal({
  profile,
  memberId,
  onClose,
  onSaved,
}: {
  profile: Profile | null;
  memberId?: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [dateOfBirth, setDateOfBirth] = useState(
    profile?.date_of_birth ? profile.date_of_birth.slice(0, 10) : ""
  );
  const [gender, setGender] = useState(profile?.gender ?? "");
  const [height, setHeight] = useState(profile?.height ?? "");
  const [weight, setWeight] = useState(profile?.weight ?? "");
  const [bloodGroup, setBloodGroup] = useState(profile?.blood_group ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateProfile(
        {
          dateOfBirth: dateOfBirth || null,
          gender: gender || null,
          height: height || null,
          weight: weight || null,
          bloodGroup: bloodGroup || null,
        },
        memberId
      );
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border-2 border-[#D6E4F5] rounded-xl focus:outline-none focus:border-[#2F5D9F] bg-white";

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#1F3E72]">Edit Details</h3>
          <button
            onClick={onClose}
            className="text-[#5C7BA8] hover:text-[#1F3E72]"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[#1F3E72] mb-2">Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[#1F3E72] mb-2">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={inputClass}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#1F3E72] mb-2">Height</label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className={inputClass}
                placeholder="e.g. 175 cm"
              />
            </div>
            <div>
              <label className="block text-[#1F3E72] mb-2">Weight</label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={inputClass}
                placeholder="e.g. 70 kg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#1F3E72] mb-2">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className={inputClass}
            >
              <option value="">Select</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
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
      </div>
    </div>
  );
}
