import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getProfile, Profile } from "../api/profile";

function ageFromDob(dob?: string | null): string {
  if (!dob) return "—";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "—";
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return `${age}`;
}

export default function ViewProfileModal({
  memberId,
  memberName,
  onClose,
}: {
  memberId: number;
  memberName: string;
  onClose: () => void;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile(memberId)
      .then(setProfile)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [memberId]);

  const Row = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex justify-between p-3 bg-[#EAF2FB] rounded-lg">
      <span className="text-[#5C7BA8]">{label}</span>
      <span className="text-[#1F3E72]">{value || "—"}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#1F3E72]">{memberName}</h3>
          <button
            onClick={onClose}
            className="text-[#5C7BA8] hover:text-[#1F3E72]"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <p className="text-[#5C7BA8]">Loading...</p>
        ) : error ? (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        ) : (
          <div className="space-y-3">
            <Row label="Email" value={profile?.email} />
            {profile?.relationship && (
              <Row label="Relationship" value={profile.relationship} />
            )}
            <Row label="Age" value={ageFromDob(profile?.date_of_birth)} />
            <Row label="Gender" value={profile?.gender} />
            <Row label="Height" value={profile?.height} />
            <Row label="Weight" value={profile?.weight} />
            <Row label="Blood Group" value={profile?.blood_group} />
          </div>
        )}
      </div>
    </div>
  );
}
