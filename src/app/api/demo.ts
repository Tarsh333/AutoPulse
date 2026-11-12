// Frontend-only "demo mode".
//
// Lets a visitor explore AutoPulse without signing in. We put a sentinel token
// in the session (see DEMO_TOKEN in client.ts); apiRequest/apiStream detect it
// and route here instead of hitting the backend. Reads return the canned data
// below; writes and downloads surface a friendly read-only message.

import type { AuthUser } from "./client";
import type { Profile } from "./profile";
import type { DocumentItem, MetricSeries } from "./documents";
import type { FamilyMember } from "./members";
import type { AppointmentRow } from "./appointments";

export const DEMO_USER: AuthUser = {
  id: 1,
  name: "Riya Sharma",
  email: "demo@autopulse.app",
  role: "MAIN_MEMBER",
  main_member_id: null,
};

// The family member a demo visitor can drill into (memberId = 2).
const DEMO_MEMBER: FamilyMember = {
  id: 2,
  name: "Arjun Sharma",
  email: "arjun.demo@autopulse.app",
  role: "MEMBER",
  relationship: "Son",
  created_at: "2024-02-10T09:00:00.000Z",
};

const SELF_PROFILE: Profile = {
  id: 1,
  name: "Riya Sharma",
  email: "demo@autopulse.app",
  role: "MAIN_MEMBER",
  date_of_birth: "1990-04-12",
  gender: "Female",
  height: "165 cm",
  weight: "60 kg",
  blood_group: "O+",
};

const MEMBER_PROFILE: Profile = {
  id: 2,
  name: "Arjun Sharma",
  email: "arjun.demo@autopulse.app",
  role: "MEMBER",
  relationship: "Son",
  date_of_birth: "2015-07-21",
  gender: "Male",
  height: "128 cm",
  weight: "26 kg",
  blood_group: "O+",
};

const SELF_DOCUMENTS: DocumentItem[] = [
  {
    id: 101,
    category: "lab_report",
    file_name: "CBC & Lipid Panel — Mar 2025.pdf",
    mime_type: "application/pdf",
    size_bytes: 184320,
    document_type: "lab_report",
    extraction_status: "done",
    extraction_error: null,
    created_at: "2025-03-14T10:30:00.000Z",
    extracted_data: {
      document_type: "lab_report",
      metrics: [
        { name: "Hemoglobin", value: 13.2, unit: "g/dL", reference_range: "12.0–15.5" },
        { name: "Fasting Blood Sugar", value: 96, unit: "mg/dL", reference_range: "70–100" },
        { name: "Total Cholesterol", value: 192, unit: "mg/dL", reference_range: "< 200" },
      ],
    },
  },
  {
    id: 102,
    category: "prescription",
    file_name: "Dr. Mehta — Prescription.pdf",
    mime_type: "application/pdf",
    size_bytes: 92160,
    document_type: "prescription",
    extraction_status: "done",
    extraction_error: null,
    created_at: "2025-02-02T16:05:00.000Z",
    extracted_data: {
      document_type: "prescription",
      medicines: [
        { name: "Vitamin D3", strength: "60000 IU", dose: "1 sachet", frequency: "Once a week", duration: "8 weeks" },
        { name: "Ferrous Ascorbate", strength: "100 mg", dose: "1 tablet", frequency: "Once daily", duration: "1 month" },
      ],
    },
  },
  {
    id: 103,
    category: "lab_report",
    file_name: "CBC & Lipid Panel — Nov 2024.pdf",
    mime_type: "application/pdf",
    size_bytes: 176128,
    document_type: "lab_report",
    extraction_status: "done",
    extraction_error: null,
    created_at: "2024-11-09T09:15:00.000Z",
    extracted_data: {
      document_type: "lab_report",
      metrics: [
        { name: "Hemoglobin", value: 11.8, unit: "g/dL", reference_range: "12.0–15.5" },
        { name: "Fasting Blood Sugar", value: 104, unit: "mg/dL", reference_range: "70–100" },
        { name: "Total Cholesterol", value: 214, unit: "mg/dL", reference_range: "< 200" },
      ],
    },
  },
];

const MEMBER_DOCUMENTS: DocumentItem[] = [
  {
    id: 201,
    category: "prescription",
    file_name: "Pediatric Visit — Prescription.pdf",
    mime_type: "application/pdf",
    size_bytes: 71680,
    document_type: "prescription",
    extraction_status: "done",
    extraction_error: null,
    created_at: "2025-01-20T11:45:00.000Z",
    extracted_data: {
      document_type: "prescription",
      medicines: [
        { name: "Amoxicillin", strength: "250 mg", dose: "5 mL", frequency: "Twice daily", duration: "5 days" },
      ],
    },
  },
];

// Two readings per metric (Nov 2024 → Mar 2025) so the trend chart has a line.
const SELF_METRICS: MetricSeries[] = [
  {
    name: "Hemoglobin",
    unit: "g/dL",
    reference_range: "12.0–15.5",
    points: [
      { date: "2024-11-09", value: 11.8 },
      { date: "2025-03-14", value: 13.2 },
    ],
  },
  {
    name: "Fasting Blood Sugar",
    unit: "mg/dL",
    reference_range: "70–100",
    points: [
      { date: "2024-11-09", value: 104 },
      { date: "2025-03-14", value: 96 },
    ],
  },
  {
    name: "Total Cholesterol",
    unit: "mg/dL",
    reference_range: "< 200",
    points: [
      { date: "2024-11-09", value: 214 },
      { date: "2025-03-14", value: 192 },
    ],
  },
];

const SELF_APPOINTMENTS: AppointmentRow[] = [
  {
    id: 301,
    title: "Annual check-up — Dr. Mehta",
    appt_date: "2026-12-04",
    appt_time: "10:30",
    duration_mins: 30,
    location: "Apollo Clinic, Indiranagar",
    notes: "Carry the latest lipid panel.",
  },
];

const CHAT_ANSWER =
  "Here's a quick summary from your demo records: your most recent lab panel " +
  "(Mar 2025) looks good — Hemoglobin improved to 13.2 g/dL (normal), Fasting " +
  "Blood Sugar is 96 mg/dL (normal), and Total Cholesterol came down to 192 " +
  "mg/dL, now under the 200 mark. You're on Vitamin D3 weekly and a daily iron " +
  "supplement. This is sample data — sign up to ask about your own reports.";

class DemoReadOnlyError extends Error {
  constructor(message = "This is read-only demo data. Sign up to save changes.") {
    super(message);
  }
}

function memberIdFromQuery(query: string): number | undefined {
  const m = query.match(/memberId=(\d+)/);
  return m ? Number(m[1]) : undefined;
}

// Returns canned data for reads; throws a friendly error for writes/downloads.
export function getDemoResponse<T>(path: string, method: string): T {
  const [route, query = ""] = path.split("?");
  const memberId = memberIdFromQuery(query);
  const isMember = memberId === DEMO_MEMBER.id;

  if (method === "GET") {
    switch (true) {
      case route === "/profile":
        return (isMember ? MEMBER_PROFILE : SELF_PROFILE) as T;
      case route === "/documents":
        return (isMember ? MEMBER_DOCUMENTS : SELF_DOCUMENTS) as T;
      case route === "/documents/metrics":
        return { metrics: isMember ? [] : SELF_METRICS } as T;
      case route === "/members":
        return [DEMO_MEMBER] as T;
      case route === "/appointments":
        return (isMember ? [] : SELF_APPOINTMENTS) as T;
      case /^\/documents\/\d+\/download$/.test(route):
        throw new DemoReadOnlyError(
          "File downloads aren't available in the demo. Sign up to upload and download your own documents."
        );
    }
  }

  if (route === "/chat" && method === "POST") {
    return { answer: CHAT_ANSWER } as T;
  }

  // Any other write (POST/PUT/PATCH/DELETE) is a no-op in the demo.
  throw new DemoReadOnlyError();
}

// Streams the canned chat answer word-by-word so the chat widget feels live.
export function streamDemoChat(onChunk: (delta: string) => void): void {
  for (const word of CHAT_ANSWER.split(" ")) {
    onChunk(word + " ");
  }
}
