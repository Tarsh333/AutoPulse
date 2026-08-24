import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Search, Users, LogOut, RefreshCw, Pencil, ArrowLeft } from "lucide-react";
import AddPrescriptionModal from "./AddPrescriptionModal";
import AddReportModal from "./AddReportModal";
import ShareQRModal from "./ShareQRModal";
import ExtractedView from "./ExtractedView";
import EditProfileModal from "./EditProfileModal";
import AppointmentCard from "./AppointmentCard";
import { ActiveMember } from "../App";
import { getProfile, Profile } from "../api/profile";
import {
  getDocuments,
  getDownloadUrl,
  reExtractDocument,
  getMetrics,
  MetricSeries,
  DocumentItem,
} from "../api/documents";

// Appointment card has no backend endpoint yet — kept as mock UI.

interface DashboardProps {
  activeMember: ActiveMember | null;
  onNavigateToMembers: () => void;
  onViewSelf: () => void;
  onLogout: () => void;
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

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

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  processing: "bg-blue-50 text-blue-600",
  done: "bg-green-50 text-green-600",
  failed: "bg-red-50 text-red-600",
  skipped: "bg-gray-100 text-gray-500",
};

export default function Dashboard({
  activeMember,
  onNavigateToMembers,
  onViewSelf,
  onLogout,
}: DashboardProps) {
  // When managing a family member, scope all data to their id.
  const memberId = activeMember?.id;

  const [metrics, setMetrics] = useState<MetricSeries[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadMetrics = async () => {
    try {
      const { metrics } = await getMetrics(memberId);
      setMetrics(metrics);
      setSelectedMetric((prev) =>
        prev && metrics.some((m) => m.name === prev)
          ? prev
          : metrics[0]?.name ?? ""
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const loadDocuments = async () => {
    try {
      setDocuments(await getDocuments(memberId));
      await loadMetrics();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const loadProfile = () => {
    getProfile(memberId)
      .then(setProfile)
      .catch((err) => setError((err as Error).message));
  };

  // Reload everything when switching between self and a member.
  useEffect(() => {
    loadProfile();
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  // Poll while any document is still being processed by the worker.
  useEffect(() => {
    const anyPending = documents.some(
      (d) => d.extraction_status === "pending" || d.extraction_status === "processing"
    );
    if (!anyPending) return;
    const t = setInterval(loadDocuments, 4000);
    return () => clearInterval(t);
  }, [documents]);

  const handleDownload = async (id: number) => {
    try {
      const { url } = await getDownloadUrl(id);
      window.open(url, "_blank");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleReExtract = async (id: number) => {
    try {
      await reExtractDocument(id);
      await loadDocuments();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const filtered = documents.filter((d) =>
    d.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSeries = metrics.find((m) => m.name === selectedMetric) ?? null;
  const chartData = activeSeries
    ? activeSeries.points.map((p) => ({
        time: new Date(p.date).toLocaleDateString(),
        value: p.value,
      }))
    : [];

  return (
    <div className="min-h-screen bg-[#EAF2FB] flex">
      {/* Left Panel - Basic Details */}
      <div className="w-80 bg-white border-r border-[#D6E4F5] p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onNavigateToMembers}
            className="flex items-center gap-2 text-[#2F5D9F] hover:text-[#1F3E72] transition-colors"
          >
            <Users size={20} />
            <span>All Members</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 text-[#5C7BA8] hover:text-[#1F3E72] transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>

        {activeMember && (
          <div className="mb-6 p-3 rounded-xl bg-[#EAF2FB] flex items-center justify-between">
            <span className="text-sm text-[#1F3E72]">
              Managing <b>{activeMember.name}</b>
            </span>
            <button
              onClick={onViewSelf}
              title="Back to my dashboard"
              className="flex items-center gap-1 text-[#2F5D9F] hover:text-[#1F3E72] text-sm"
            >
              <ArrowLeft size={14} /> Me
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#1F3E72]">Basic Details</h3>
          <button
            onClick={() => setShowProfileModal(true)}
            title="Edit details"
            className="flex items-center gap-1 text-[#2F5D9F] hover:text-[#1F3E72] text-sm"
          >
            <Pencil size={15} /> Edit
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center pb-6 border-b border-[#D6E4F5]">
            <div className="w-24 h-24 rounded-full bg-[#2F5D9F] text-white flex items-center justify-center text-2xl mb-4">
              {initials(profile?.name)}
            </div>
            <h4 className="text-[#1F3E72]">{profile?.name ?? "..."}</h4>
            <p className="text-[#5C7BA8]">
              {ageFromDob(profile?.date_of_birth)} years
              {profile?.gender ? `, ${profile.gender}` : ""}
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#EAF2FB] rounded-xl">
              <p className="text-sm text-[#5C7BA8] mb-1">Height</p>
              <p className="text-[#1F3E72]">{profile?.height ?? "—"}</p>
            </div>

            <div className="p-4 bg-[#EAF2FB] rounded-xl">
              <p className="text-sm text-[#5C7BA8] mb-1">Weight</p>
              <p className="text-[#1F3E72]">{profile?.weight ?? "—"}</p>
            </div>

            <div className="p-4 bg-[#EAF2FB] rounded-xl">
              <p className="text-sm text-[#5C7BA8] mb-1">Blood Group</p>
              <p className="text-[#1F3E72]">{profile?.blood_group ?? "—"}</p>
            </div>
          </div>

          <button
            onClick={onNavigateToMembers}
            className="w-full py-3 border-2 border-[#2F5D9F] text-[#2F5D9F] rounded-xl hover:bg-[#EAF2FB] transition-colors"
          >
            View All Members
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Top Actions */}
          <div
            className={`grid ${
              memberId ? "grid-cols-2" : "grid-cols-3"
            } gap-4`}
          >
            <button
              onClick={() => setShowPrescriptionModal(true)}
              className="p-6 bg-white border border-[#D6E4F5] rounded-xl hover:border-[#2F5D9F] transition-colors text-[#1F3E72]"
            >
              Add Prescription
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="p-6 bg-white border border-[#D6E4F5] rounded-xl hover:border-[#2F5D9F] transition-colors text-[#1F3E72]"
            >
              Add Report
            </button>
            {!memberId && (
              <button
                onClick={() => setShowQRModal(true)}
                className="p-6 bg-white border border-[#D6E4F5] rounded-xl hover:border-[#2F5D9F] transition-colors text-[#1F3E72]"
              >
                Share QR
              </button>
            )}
          </div>

          {/* Health Data Graph — from extracted lab-report metrics */}
          <div className="bg-white rounded-xl p-6 border border-[#D6E4F5]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#1F3E72]">
                Health Data
                {activeSeries?.unit ? ` (${activeSeries.unit})` : ""}
              </h3>
              {metrics.length > 0 && (
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-4 py-2 border border-[#D6E4F5] rounded-lg focus:outline-none focus:border-[#2F5D9F] bg-white text-[#1F3E72]"
                >
                  {metrics.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {metrics.length === 0 ? (
              <p className="text-[#5C7BA8] py-12 text-center">
                No lab-report data yet. Upload a lab report and the extracted
                metrics will be charted here.
              </p>
            ) : chartData.length === 1 ? (
              <p className="text-[#5C7BA8] py-12 text-center">
                Only one reading for {selectedMetric} so far
                {` (${chartData[0].value}${
                  activeSeries?.unit ? " " + activeSeries.unit : ""
                })`}
                . Upload more lab reports to see a trend.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D6E4F5" />
                  <XAxis dataKey="time" stroke="#5C7BA8" />
                  <YAxis stroke="#5C7BA8" domain={["auto", "auto"]} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2F5D9F"
                    strokeWidth={2}
                    dot={{ fill: "#2F5D9F", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {activeSeries?.reference_range && (
              <p className="text-sm text-[#5C7BA8] mt-3 text-center">
                Reference range: {activeSeries.reference_range}
                {activeSeries.unit ? ` ${activeSeries.unit}` : ""}
              </p>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl p-6 border border-[#D6E4F5]">
            <h3 className="text-[#1F3E72] mb-4">
              {activeMember ? `${activeMember.name}'s Documents` : "My Documents"}
            </h3>

            <div className="relative mb-4">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C7BA8]"
                size={18}
              />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#D6E4F5] rounded-lg focus:outline-none focus:border-[#2F5D9F] bg-white"
              />
            </div>

            {filtered.length === 0 ? (
              <p className="text-[#5C7BA8]">No documents yet.</p>
            ) : (
              <div className="space-y-3">
                {filtered.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-[#D6E4F5] rounded-lg hover:bg-[#EAF2FB] transition-colors"
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="min-w-0">
                        <p className="text-[#1F3E72] truncate">
                          {doc.file_name}
                        </p>
                        <p className="text-sm text-[#5C7BA8]">
                          {new Date(doc.created_at).toLocaleDateString()}
                          {doc.category ? ` · ${doc.category}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            statusStyles[doc.extraction_status] ??
                            "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {doc.extraction_status}
                        </span>
                        {(doc.extraction_status === "failed" ||
                          doc.extraction_status === "skipped") && (
                          <button
                            onClick={() => handleReExtract(doc.id)}
                            title="Re-run extraction"
                            className="text-[#2F5D9F] hover:text-[#1F3E72]"
                          >
                            <RefreshCw size={16} />
                          </button>
                        )}
                        {doc.extracted_data && (
                          <button
                            onClick={() =>
                              setExpandedId(
                                expandedId === doc.id ? null : doc.id
                              )
                            }
                            className="text-[#2F5D9F] hover:underline"
                          >
                            {expandedId === doc.id ? "Hide" : "View Data"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(doc.id)}
                          className="text-[#2F5D9F] hover:underline"
                        >
                          Download
                        </button>
                      </div>
                    </div>

                    {expandedId === doc.id && doc.extracted_data && (
                      <div className="px-4 pb-4">
                        <ExtractedView data={doc.extracted_data} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Appointment */}
      <div className="w-80 bg-white border-l border-[#D6E4F5] p-6">
        <h3 className="text-[#1F3E72] mb-6">Next Appointment</h3>
        <AppointmentCard memberId={memberId} />
      </div>

      {/* Modals */}
      {showPrescriptionModal && (
        <AddPrescriptionModal
          memberId={memberId}
          onClose={() => setShowPrescriptionModal(false)}
          onUploaded={loadDocuments}
        />
      )}
      {showReportModal && (
        <AddReportModal
          memberId={memberId}
          onClose={() => setShowReportModal(false)}
          onUploaded={loadDocuments}
        />
      )}
      {showQRModal && (
        <ShareQRModal
          documents={documents}
          onClose={() => setShowQRModal(false)}
        />
      )}
      {showProfileModal && (
        <EditProfileModal
          profile={profile}
          memberId={memberId}
          onClose={() => setShowProfileModal(false)}
          onSaved={() => {
            setShowProfileModal(false);
            loadProfile();
          }}
        />
      )}
    </div>
  );
}
