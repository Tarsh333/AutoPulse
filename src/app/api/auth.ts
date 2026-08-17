import { apiRequest, setSession, AuthUser } from "./client";

interface AuthResult {
  user: AuthUser;
  token: string;
}

// Main member registration (name + email + password).
export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResult> {
  const data = await apiRequest<AuthResult>("/auth/register", {
    method: "POST",
    auth: false,
    body: { name, email, password },
  });
  setSession(data.token, data.user);
  return data;
}

// Main member login (backend authenticates by name + password).
export async function login(
  name: string,
  password: string
): Promise<AuthResult> {
  const data = await apiRequest<AuthResult>("/auth/login", {
    method: "POST",
    auth: false,
    body: { name, password },
  });
  setSession(data.token, data.user);
  return data;
}

// Family member login is passwordless (email OTP).
export async function sendOtp(email: string): Promise<void> {
  await apiRequest("/auth/send-otp", {
    method: "POST",
    auth: false,
    body: { email },
  });
}

export async function verifyOtp(
  email: string,
  otp: string
): Promise<AuthResult> {
  const data = await apiRequest<AuthResult>("/auth/verify-otp", {
    method: "POST",
    auth: false,
    body: { email, otp },
  });
  setSession(data.token, data.user);
  return data;
}
