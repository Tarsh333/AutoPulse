import { useEffect, useState } from "react";
import { CalendarPlus, Pencil } from "lucide-react";
import { Appointment, googleCalendarUrl } from "../lib/calendar";
import {
  getAppointment,
  saveAppointment,
  clearAppointment,
} from "../api/appointments";

// `memberId` scopes the appointment to a managed member (undefined = self).
export default function AppointmentCard({ memberId }: { memberId?: number }) {
  const [appt, setAppt] = useState<Appointment | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const fillForm = (a: Appointment | null) => {
    setTitle(a?.title ?? "");
    setDate(a?.date ?? "");
    setTime(a?.time ?? "");
    setDuration(a ? String(a.durationMins) : "30");
    setLocation(a?.location ?? "");
    setNotes(a?.notes ?? "");
  };

  useEffect(() => {
    setLoading(true);
    getAppointment(memberId)
      .then((a) => {
        setAppt(a);
        setEditing(!a);
        fillForm(a);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [memberId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const next: Appointment = {
      title,
      date,
      time,
      durationMins: Number(duration) || 30,
      location: location || undefined,
      notes: notes || undefined,
    };
    try {
      await saveAppointment(next, memberId);
      setAppt(next);
      setEditing(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearAppointment(memberId);
      setAppt(null);
      fillForm(null);
      setEditing(true);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-[#D6E4F5] rounded-lg focus:outline-none focus:border-[#2F5D9F] bg-white text-sm";

  if (loading) {
    return <p className="text-[#5C7BA8] text-sm">Loading...</p>;
  }

  if (editing || !appt) {
    return (
      <form onSubmit={handleSave} className="space-y-3">
        {error && (
          <div className="p-2 rounded-lg bg-red-50 text-red-600 text-xs">
            {error}
          </div>
        )}
        <input
          className={inputClass}
          placeholder="Doctor / title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            className={inputClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            type="time"
            className={inputClass}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        <select
          className={inputClass}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        >
          <option value="15">15 min</option>
          <option value="30">30 min</option>
          <option value="45">45 min</option>
          <option value="60">1 hour</option>
        </select>
        <input
          className={inputClass}
          placeholder="Location (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex gap-2">
          {appt && (
            <button
              type="button"
              onClick={() => {
                fillForm(appt);
                setEditing(false);
              }}
              className="flex-1 py-2 border border-[#D6E4F5] text-[#1F3E72] rounded-lg text-sm"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2 bg-[#2F5D9F] text-white rounded-lg text-sm hover:bg-[#1F3E72] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="p-6 border border-[#D6E4F5] rounded-xl bg-[#EAF2FB]">
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm text-[#5C7BA8]">Upcoming</p>
        <button
          onClick={() => setEditing(true)}
          title="Edit"
          className="text-[#2F5D9F] hover:text-[#1F3E72]"
        >
          <Pencil size={14} />
        </button>
      </div>
      <p className="text-[#1F3E72] mb-1">{appt.title}</p>
      <p className="text-[#5C7BA8]">
        {new Date(`${appt.date}T${appt.time}:00`).toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>
      {appt.location && (
        <p className="text-[#5C7BA8] text-sm mt-1">{appt.location}</p>
      )}

      <a
        href={googleCalendarUrl(appt)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 bg-[#2F5D9F] text-white rounded-lg hover:bg-[#1F3E72] transition-colors text-sm"
      >
        <CalendarPlus size={16} /> Add to Google Calendar
      </a>

      <button
        onClick={handleClear}
        className="mt-2 w-full text-[#5C7BA8] hover:text-[#1F3E72] text-xs"
      >
        Clear
      </button>
    </div>
  );
}
