import { useEffect, useState } from "react";
import { ArrowLeft, Trash2, Eye } from "lucide-react";
import AddMemberModal from "./AddMemberModal";
import ViewProfileModal from "./ViewProfileModal";
import { getMembers, addMember, deleteMember, FamilyMember } from "../api/members";
import { getUser } from "../api/client";

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
  const me = getUser();
  const isMain = me?.role === "MAIN_MEMBER";

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMember, setViewMember] = useState<FamilyMember | null>(null);
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

  const handleDelete = async (m: FamilyMember) => {
    if (!confirm(`Remove ${m.name}? This deletes their documents too.`)) return;
    try {
      await deleteMember(m.id);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAF2FB]">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8 gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#2F5D9F] hover:text-[#1F3E72] transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <h2 className="text-[#1F3E72]">Family Members</h2>

          {isMain ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 sm:px-6 py-3 bg-[#2F5D9F] text-white rounded-xl hover:bg-[#1F3E72] transition-colors"
            >
              Add Member
            </button>
          ) : (
            <span className="w-10" />
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-[#5C7BA8]">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="text-[#5C7BA8]">No family members yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => {
              const isSelf = me?.id === member.id;
              return (
                <div
                  key={member.id}
                  className="bg-white p-6 rounded-xl border-2 border-[#D6E4F5] shadow-sm"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-[#2F5D9F] text-white flex items-center justify-center text-xl">
                      {initials(member.name)}
                    </div>

                    <div>
                      <h3 className="text-[#1F3E72] mb-1">
                        {member.name}
                        {isSelf && (
                          <span className="text-[#5C7BA8] text-sm"> (You)</span>
                        )}
                      </h3>
                      <p className="text-[#5C7BA8] text-sm">{member.email}</p>
                      <p className="text-[#5C7BA8] text-sm capitalize">
                        {member.role === "MAIN_MEMBER"
                          ? "Main member"
                          : member.relationship}
                      </p>
                    </div>

                    <div className="w-full pt-4 border-t border-[#D6E4F5] flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => setViewMember(member)}
                        className="flex items-center gap-1 px-3 py-2 text-[#2F5D9F] border border-[#2F5D9F] rounded-lg hover:bg-[#EAF2FB] text-sm"
                      >
                        <Eye size={15} /> View
                      </button>

                      {/* Main member can manage (upload/edit) any member. */}
                      {isMain && (
                        <button
                          onClick={() =>
                            onSelectMember({ id: member.id, name: member.name })
                          }
                          className="px-3 py-2 bg-[#2F5D9F] text-white rounded-lg hover:bg-[#1F3E72] text-sm"
                        >
                          Manage
                        </button>
                      )}

                      {/* Main member can delete other members (not self). */}
                      {isMain && !isSelf && member.role === "MEMBER" && (
                        <button
                          onClick={() => handleDelete(member)}
                          title="Remove member"
                          className="flex items-center px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddMember}
        />
      )}

      {viewMember && (
        <ViewProfileModal
          memberId={viewMember.id}
          memberName={viewMember.name}
          onClose={() => setViewMember(null)}
        />
      )}
    </div>
  );
}
