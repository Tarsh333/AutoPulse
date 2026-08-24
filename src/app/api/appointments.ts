import { apiRequest } from "./client";
import { Appointment } from "../lib/calendar";

// Backend row shape (snake_case, one per user).
interface AppointmentRow {
  title: string;
  appt_date: string;
  appt_time: string;
  duration_mins: number;
  location: string | null;
  notes: string | null;
}

const memberQuery = (memberId?: number) =>
  memberId ? `?memberId=${memberId}` : "";

export async function getAppointment(
  memberId?: number
): Promise<Appointment | null> {
  const row = await apiRequest<AppointmentRow | null>(
    `/appointments${memberQuery(memberId)}`
  );
  if (!row) return null;
  return {
    title: row.title,
    date: row.appt_date,
    time: row.appt_time,
    durationMins: row.duration_mins,
    location: row.location ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export async function saveAppointment(
  appt: Appointment,
  memberId?: number
): Promise<void> {
  await apiRequest("/appointments", {
    method: "PUT",
    body: memberId ? { ...appt, memberId } : appt,
  });
}

export async function clearAppointment(memberId?: number): Promise<void> {
  await apiRequest(`/appointments${memberQuery(memberId)}`, {
    method: "DELETE",
  });
}
