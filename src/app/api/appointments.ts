import { apiRequest } from "./client";
import { Appointment } from "../lib/calendar";

export interface AppointmentRecord extends Appointment {
  id: number;
}

interface AppointmentRow {
  id: number;
  title: string;
  appt_date: string;
  appt_time: string;
  duration_mins: number;
  location: string | null;
  notes: string | null;
}

const memberQuery = (memberId?: number) =>
  memberId ? `?memberId=${memberId}` : "";

const toRecord = (r: AppointmentRow): AppointmentRecord => ({
  id: r.id,
  title: r.title,
  date: r.appt_date,
  time: r.appt_time,
  durationMins: r.duration_mins,
  location: r.location ?? undefined,
  notes: r.notes ?? undefined,
});

export async function getAppointments(
  memberId?: number
): Promise<AppointmentRecord[]> {
  const rows = await apiRequest<AppointmentRow[]>(
    `/appointments${memberQuery(memberId)}`
  );
  return rows.map(toRecord);
}

export async function createAppointment(
  appt: Appointment,
  memberId?: number
): Promise<void> {
  await apiRequest("/appointments", {
    method: "POST",
    body: memberId ? { ...appt, memberId } : appt,
  });
}

export async function updateAppointment(
  id: number,
  appt: Appointment
): Promise<void> {
  await apiRequest(`/appointments/${id}`, { method: "PUT", body: appt });
}

export async function deleteAppointment(id: number): Promise<void> {
  await apiRequest(`/appointments/${id}`, { method: "DELETE" });
}
