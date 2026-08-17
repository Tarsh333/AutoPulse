// Thin fetch wrapper around the AutoPulse backend.
// Handles the base URL, JWT auth header, JSON parsing and error surfacing.

const BASE_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";

const TOKEN_KEY = "autopulse_token";
const USER_KEY = "autopulse_user";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  main_member_id?: number | null;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// The backend always responds with { success, message?, data? }.
interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface RequestOptions {
  method?: string;
  // Plain object -> JSON body. FormData -> sent as-is (for file uploads).
  body?: unknown;
  auth?: boolean;
}

export async function apiRequest<T = unknown>(
  path: string,
  { method = "GET", body, auth = true }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {};

  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let payload: BodyInit | undefined;

  if (body instanceof FormData) {
    // Let the browser set the multipart boundary — do NOT set Content-Type.
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { method, headers, body: payload });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  let json: ApiEnvelope<T> | null = null;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // Non-JSON response (unexpected).
  }

  if (!res.ok || !json || json.success === false) {
    if (res.status === 401) {
      clearSession();
    }
    throw new Error(json?.message || `Request failed (${res.status})`);
  }

  return json.data as T;
}
