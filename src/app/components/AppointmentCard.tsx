import { useEffect, useState } from "react";
import { CalendarPlus, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Appointment, googleCalendarUrl } from "../lib/calendar";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  AppointmentRecord,
} from "../api/appointments";

export default function AppointmentCard({
  memberId,
  canEdit = true,
}: {
  memberId?: number;
  canEdit?: boolean;
}) {
  const [appts, setAppts] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // formFor: "new" | id | null
  const [formFor, setFormFor] = useState<number | "new" | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setAppts(await getAppointments(memberId));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  const openNew = () => {
    setTitle("");
    setDate("");
    setTime("");
    setDuration("30");
    setLocation("");
    setNotes("");
    setFormFor("new");
  };

  const openEdit = (a: AppointmentRecord) => {
    setTitle(a.title);
    setDate(a.date);
    setTime(a.time);
    setDuration(String(a.durationMins));
    setLocation(a.location ?? "");
    setNotes(a.notes ?? "");
    setFormFor(a.id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload: Appointment = {
      title,
      date,
      time,
      durationMins: Number(duration) || 30,
      location: location || undefined,
      notes: notes || undefined,
    };
    try {
      if (formFor === "new") {
        await createAppointment(payload, memberId);
      } else if (typeof formFor === "number") {
        await updateAppointment(formFor, payload);
      }
      setFormFor(null);
      toast.success("Appointment saved");
      await load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAppointment(id);
      toast.success("Appointment removed");
      await load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F5D9F]/30 focus:border-[#2F5D9F] bg-white text-sm transition";

  if (loading) return <p className="text-slate-400 text-sm">Loading...</p>;

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-2 rounded-lg bg-red-50 text-red-600 text-xs">
          {error}
        </div>
      )}

      {appts.length === 0 && formFor !== "new" && (
        <p className="text-slate-400 text-sm">No upcoming appointments.</p>
      )}

      {appts.map((a) =>
        formFor === a.id ? (
          <AppointmentForm
            key={a.id}
            {...{ title, date, time, duration, location, notes, saving, inputClass }}
            setters={{ setTitle, setDate, setTime, setDuration, setLocation, setNotes }}
            onSubmit={handleSave}
            onCancel={() => setFormFor(null)}
          />
        ) : (
          <div
            key={a.id}
            className="p-4 rounded-xl bg-gradient-to-br from-[#EAF2FB] to-white border border-slate-100 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <p className="text-[#1F3E72] font-medium">{a.title}</p>
              {canEdit && (
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(a)}
                    className="text-slate-400 hover:text-[#2F5D9F] transition"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-slate-400 hover:text-red-500 transition"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-1">
              {new Date(`${a.date}T${a.time}:00`).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            {a.location && (
              <p className="text-slate-400 text-xs mt-0.5">{a.location}</p>
            )}
            <a
              href={googleCalendarUrl(a)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[#2F5D9F] hover:text-[#1F3E72] text-sm transition"
            >
              <CalendarPlus size={15} /> Add to Google Calendar
            </a>
          </div>
        )
      )}

      {formFor === "new" && (
        <AppointmentForm
          {...{ title, date, time, duration, location, notes, saving, inputClass }}
          setters={{ setTitle, setDate, setTime, setDuration, setLocation, setNotes }}
          onSubmit={handleSave}
          onCancel={() => setFormFor(null)}
        />
      )}

      {canEdit && formFor !== "new" && (
        <button
          onClick={openNew}
          className="w-full py-2.5 flex items-center justify-center gap-2 border border-dashed border-[#2F5D9F]/40 text-[#2F5D9F] rounded-xl hover:bg-[#EAF2FB] transition text-sm"
        >
          <Plus size={16} /> Add appointment
        </button>
      )}
    </div>
  );
}

function AppointmentForm({
  title,
  date,
  time,
  duration,
  location,
  notes,
  saving,
  inputClass,
  setters,
  onSubmit,
  onCancel,
}: {
  title: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  notes: string;
  saving: boolean;
  inputClass: string;
  setters: {
    setTitle: (v: string) => void;
    setDate: (v: string) => void;
    setTime: (v: string) => void;
    setDuration: (v: string) => void;
    setLocation: (v: string) => void;
    setNotes: (v: string) => void;
  };
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-2 p-4 rounded-xl border border-slate-200 bg-white"
    >
      <input
        className={inputClass}
        placeholder="Doctor / title"
        value={title}
        onChange={(e) => setters.setTitle(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <input type="date" className={inputClass} value={date} onChange={(e) => setters.setDate(e.target.value)} required />
        <input type="time" className={inputClass} value={time} onChange={(e) => setters.setTime(e.target.value)} required />
      </div>
      <select className={inputClass} value={duration} onChange={(e) => setters.setDuration(e.target.value)}>
        <option value="15">15 min</option>
        <option value="30">30 min</option>
        <option value="45">45 min</option>
        <option value="60">1 hour</option>
      </select>
      <input className={inputClass} placeholder="Location (optional)" value={location} onChange={(e) => setters.setLocation(e.target.value)} />
      <input className={inputClass} placeholder="Notes (optional)" value={notes} onChange={(e) => setters.setNotes(e.target.value)} />
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="flex-1 py-2 bg-[#2F5D9F] text-white rounded-lg text-sm hover:bg-[#1F3E72] transition disabled:opacity-60">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
