import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import AddMemberModal from "./AddMemberModal";
import { getMembers, addMember, FamilyMember } from "../api/members";

interface FamilyMembersPageProps {
  onBack: () => void;
  onSelectMember: (m: { id: number; name: string }) => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function FamilyMembersPage({
  onBack,
  onSelectMember,
}: FamilyMembersPageProps) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setMembers(await getMembers());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddMember = async (data: {
    name: string;
    email: string;
    relationship: string;
  }) => {
    await addMember(data.name, data.email, data.relationship);
    setShowAddModal(false);
    await load();
  };

  return (
    <div className="min-h-screen bg-[#EAF2FB]">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#2F5D9F] hover:text-[#1F3E72] transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <h2 className="text-[#1F3E72]">Family Members</h2>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-[#2F5D9F] text-white rounded-xl hover:bg-[#1F3E72] transition-colors"
          >
            Add Member
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-[#5C7BA8]">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="text-[#5C7BA8]">
            No family members yet. Add your first one.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div
                key={member.id}
                onClick={() =>
                  onSelectMember({ id: member.id, name: member.name })
                }
                className="bg-white p-6 rounded-xl border-2 border-[#D6E4F5] shadow-sm cursor-pointer hover:border-[#2F5D9F] hover:shadow-md transition-all"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-[#2F5D9F] text-white flex items-center justify-center text-xl">
                    {initials(member.name)}
                  </div>

                  <div>
                    <h3 className="text-[#1F3E72] mb-2">{member.name}</h3>
                    <p className="text-[#5C7BA8]">{member.email}</p>
                    {member.relationship && (
                      <p className="text-[#5C7BA8] capitalize">
                        {member.relationship}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddMember}
        />
      )}
    </div>
  );
}
