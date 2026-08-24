export interface Appointment {
  title: string; // e.g. "Dr. Emily Carter"
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h)
  durationMins: number;
  location?: string;
  notes?: string;
}

// Google Calendar wants UTC timestamps as YYYYMMDDTHHMMSSZ.
function toGCalStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

// Builds a "create event" link that opens Google Calendar pre-filled.
export function googleCalendarUrl(appt: Appointment): string {
  const start = new Date(`${appt.date}T${appt.time}:00`);
  const end = new Date(start.getTime() + appt.durationMins * 60000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: appt.title,
    dates: `${toGCalStamp(start)}/${toGCalStamp(end)}`,
  });
  if (appt.notes) params.set("details", appt.notes);
  if (appt.location) params.set("location", appt.location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
