import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Search,
  Users,
  LogOut,
  RefreshCw,
  Pencil,
  ArrowLeft,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import AddPrescriptionModal from "./AddPrescriptionModal";
import AddReportModal from "./AddReportModal";
import ShareQRModal from "./ShareQRModal";
import ExtractedView from "./ExtractedView";
import EditProfileModal from "./EditProfileModal";
import AppointmentCard from "./AppointmentCard";
import Reveal from "./Reveal";
import EmptyState from "./EmptyState";
import ChatWidget from "./ChatWidget";
import { FileText, Trash2 } from "lucide-react";
import { ActiveMember } from "../App";
import { interpretSeries } from "../lib/metrics";
import { getUser } from "../api/client";
import { getProfile, Profile } from "../api/profile";
import {
  getDocuments,
  getDownloadUrl,
  reExtractDocument,
  renameDocument,
  deleteDocument,
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

  // You can edit your own data, or (as main member) any family member's.
  // A regular member viewing a relative is read-only.
  const isMain = getUser()?.role === "MAIN_MEMBER";
  const canEdit = !memberId || isMain;

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
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [error, setError] = useState("");

  // Collapsible sections (phone only; always expanded on lg+ via lg:block).
  // On phone, start with most sections collapsed to reduce scrolling.
  const [open, setOpen] = useState(() => {
    const mobile =
      typeof window !== "undefined" && window.innerWidth < 1024;
    return mobile
      ? { details: false, graph: false, docs: false, appt: false }
      : { details: true, graph: true, docs: false, appt: true };
  });
  const toggle = (k: keyof typeof open) =>
    setOpen((o) => ({ ...o, [k]: !o[k] }));

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
      toast.success("Queued for re-extraction");
      await loadDocuments();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDeleteDoc = async (doc: DocumentItem) => {
    if (!confirm(`Delete "${doc.file_name}"? This cannot be undone.`)) return;
    try {
      await deleteDocument(doc.id);
      toast.success("Document deleted");
      await loadDocuments();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const startRename = (doc: DocumentItem) => {
    setRenamingId(doc.id);
    setRenameValue(doc.file_name);
  };

  const saveRename = async (id: number) => {
    const name = renameValue.trim();
    if (!name) return;
    try {
      await renameDocument(id, name);
      setRenamingId(null);
      toast.success("Renamed");
      await loadDocuments();
    } catch (err) {
      toast.error((err as Error).message);
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
  const interpretation = activeSeries ? interpretSeries(activeSeries) : null;

  const statusChip: Record<string, string> = {
    normal: "bg-green-50 text-green-700",
    high: "bg-red-50 text-red-700",
    low: "bg-amber-50 text-amber-700",
    unknown: "bg-gray-100 text-gray-500",
  };
  const trendChip: Record<string, string> = {
    improving: "bg-green-50 text-green-700",
    worsening: "bg-red-50 text-red-700",
    stable: "bg-blue-50 text-blue-700",
    none: "bg-gray-100 text-gray-500",
  };

  // Collapse toggle for a section. Mobile-only by default; pass `always` to
  // show it on all breakpoints too.
  const Chevron = ({
    k,
    always = false,
  }: {
    k: keyof typeof open;
    always?: boolean;
  }) => (
    <button
      type="button"
      onClick={() => toggle(k)}
      className={`${always ? "" : "lg:hidden "}text-[#5C7BA8]`}
      aria-label="Toggle section"
    >
      <ChevronDown
        size={20}
        className={`transition-transform ${open[k] ? "rotate-180" : ""}`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAF2FB] via-white to-[#EAF2FB] flex flex-col lg:flex-row">
      {/* Left Panel - Basic Details */}
      <div className="w-full lg:w-80 bg-white/80 backdrop-blur border-b lg:border-b-0 lg:border-r border-slate-100 p-6">
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
          <div className="flex items-center gap-2">
            <h3 className="text-[#1F3E72]">Basic Details</h3>
            <Chevron k="details" />
          </div>
          {canEdit && (
            <button
              onClick={() => setShowProfileModal(true)}
              title="Edit details"
              className="flex items-center gap-1 text-[#2F5D9F] hover:text-[#1F3E72] text-sm"
            >
              <Pencil size={15} /> Edit
            </button>
          )}
        </div>

        <div className={`${open.details ? "" : "hidden "}lg:block space-y-6`}>
          <div className="flex flex-col items-center pb-6 border-b border-[#D6E4F5]">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2F5D9F] to-[#1F3E72] text-white flex items-center justify-center text-2xl mb-4 shadow-lg shadow-[#2F5D9F]/30">
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
      <div className="flex-1 p-4 lg:p-8">
        <Reveal className="max-w-6xl mx-auto space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Top Actions */}
          {canEdit && (
            <div
              className={`grid gap-4 grid-cols-1 ${
                memberId ? "sm:grid-cols-2" : "sm:grid-cols-3"
              }`}
            >
              <button
                onClick={() => setShowPrescriptionModal(true)}
                className="group p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#2F5D9F] transition-all text-[#1F3E72] font-medium"
              >
                + Add Prescription
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="group p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#2F5D9F] transition-all text-[#1F3E72] font-medium"
              >
                + Add Report
              </button>
              {!memberId && (
                <button
                  onClick={() => setShowQRModal(true)}
                  className="group p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#2F5D9F] transition-all text-[#1F3E72] font-medium"
                >
                  Share QR
                </button>
              )}
            </div>
          )}

          {/* Health Data Graph — from extracted lab-report metrics */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-[#1F3E72]">
                  Health Data
                  {activeSeries?.unit ? ` (${activeSeries.unit})` : ""}
                </h3>
                <Chevron k="graph" />
              </div>
              {metrics.length > 0 && (
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-3 py-2 border border-[#D6E4F5] rounded-lg focus:outline-none focus:border-[#2F5D9F] bg-white text-[#1F3E72] text-sm"
                >
                  {metrics.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className={`${open.graph ? "" : "hidden "}lg:block`}>
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

            {interpretation && chartData.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    statusChip[interpretation.status]
                  }`}
                >
                  {interpretation.statusLabel}
                </span>
                <span
                  className={`text-sm px-3 py-1 rounded-full inline-flex items-center gap-1 ${
                    trendChip[interpretation.trend]
                  }`}
                >
                  {interpretation.trend === "improving" && <TrendingUp size={14} />}
                  {interpretation.trend === "worsening" && <TrendingDown size={14} />}
                  {(interpretation.trend === "stable" ||
                    interpretation.trend === "none") && <Minus size={14} />}
                  {interpretation.trendLabel}
                </span>
                {activeSeries?.reference_range && (
                  <span className="text-sm text-[#5C7BA8] ml-auto">
                    Normal: {activeSeries.reference_range}
                    {activeSeries.unit ? ` ${activeSeries.unit}` : ""}
                  </span>
                )}
              </div>
            )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-[#1F3E72]">
                {activeMember ? `${activeMember.name}'s Documents` : "My Documents"}
              </h3>
              <Chevron k="docs" always />
            </div>

            <div className={open.docs ? "" : "hidden"}>
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
              <EmptyState
                icon={<FileText size={26} />}
                title={searchQuery ? "No matches" : "No documents yet"}
                subtitle={
                  searchQuery
                    ? "Try a different search."
                    : "Upload a prescription or report to get started."
                }
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-slate-100 rounded-xl hover:bg-[#EAF2FB]/60 hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                      <div className="min-w-0">
                        {renamingId === doc.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveRename(doc.id);
                                if (e.key === "Escape") setRenamingId(null);
                              }}
                              className="flex-1 min-w-0 px-2 py-1 border border-[#D6E4F5] rounded-lg text-sm focus:outline-none focus:border-[#2F5D9F]"
                            />
                            <button
                              onClick={() => saveRename(doc.id)}
                              title="Save"
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => setRenamingId(null)}
                              title="Cancel"
                              className="text-[#5C7BA8] hover:text-[#1F3E72]"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="text-[#1F3E72] truncate">
                              {doc.file_name}
                            </p>
                            {canEdit && (
                              <button
                                onClick={() => startRename(doc)}
                                title="Rename"
                                className="text-[#5C7BA8] hover:text-[#2F5D9F] shrink-0"
                              >
                                <Pencil size={14} />
                              </button>
                            )}
                          </div>
                        )}
                        <p className="text-sm text-[#5C7BA8]">
                          {new Date(doc.created_at).toLocaleDateString()}
                          {doc.category ? ` · ${doc.category}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center flex-wrap gap-3 sm:shrink-0">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            statusStyles[doc.extraction_status] ??
                            "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {doc.extraction_status}
                        </span>
                        {canEdit &&
                          (doc.extraction_status === "failed" ||
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
                        {canEdit && (
                          <button
                            onClick={() => handleDeleteDoc(doc)}
                            title="Delete document"
                            className="text-slate-400 hover:text-red-500 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
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
        </Reveal>
      </div>

      {/* Right Panel - Appointment */}
      <div className="w-full lg:w-80 bg-white/80 backdrop-blur border-t lg:border-t-0 lg:border-l border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-[#1F3E72]">Next Appointment</h3>
          <Chevron k="appt" />
        </div>
        <div className={`${open.appt ? "" : "hidden "}lg:block`}>
          <AppointmentCard memberId={memberId} canEdit={canEdit} />
        </div>
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

      <ChatWidget memberId={memberId} subjectName={activeMember?.name} />
    </div>
  );
}
