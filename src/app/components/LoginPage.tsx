import { useState } from "react";
import { login, sendOtp, verifyOtp } from "../api/auth";

type Mode = "password" | "otp";

export default function LoginPage({
  onLogin,
  onSwitchToSignup,
}: {
  onLogin: () => void;
  onSwitchToSignup: () => void;
}) {
  const [mode, setMode] = useState<Mode>("password");

  // Main member (email + password)
  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");

  // Family member (email + OTP)
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginEmail, password);
      onLogin();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendOtp(email);
      setOtpSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      onLogin();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 border-2 border-[#D6E4F5] rounded-xl focus:outline-none focus:border-[#2F5D9F] bg-white transition-colors";

  return (
    <div className="min-h-screen bg-[#EAF2FB] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-12 w-full max-w-md shadow-[0_8px_30px_rgb(47,93,159,0.12)]">
        <div className="text-center mb-8">
          <h1 className="text-[#1F3E72] mb-2" style={{ fontSize: "32px" }}>
            AutoPulse
          </h1>
          <p className="text-[#5C7BA8]">Welcome back</p>
        </div>

        {/* Mode switch */}
        <div className="flex gap-2 mb-6 bg-[#EAF2FB] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode("password");
              setError("");
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              mode === "password"
                ? "bg-white text-[#1F3E72] shadow-sm"
                : "text-[#5C7BA8]"
            }`}
          >
            Login with Password
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("otp");
              setError("");
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              mode === "otp"
                ? "bg-white text-[#1F3E72] shadow-sm"
                : "text-[#5C7BA8]"
            }`}
          >
            Login with OTP
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {mode === "password" ? (
          <form onSubmit={handlePasswordLogin} className="space-y-5">
            <div>
              <label className="block text-[#1F3E72] mb-2">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className={inputClass}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-[#1F3E72] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#2F5D9F] text-white rounded-xl hover:bg-[#1F3E72] transition-colors shadow-[0_4px_14px_rgb(47,93,159,0.25)] mt-4 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
            className="space-y-5"
          >
            <div>
              <label className="block text-[#1F3E72] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="Enter your email"
                disabled={otpSent}
                required
              />
            </div>

            {otpSent && (
              <div>
                <label className="block text-[#1F3E72] mb-2">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={inputClass}
                  placeholder="Enter the 6-digit OTP"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#2F5D9F] text-white rounded-xl hover:bg-[#1F3E72] transition-colors shadow-[0_4px_14px_rgb(47,93,159,0.25)] mt-4 disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : otpSent
                ? "Verify OTP"
                : "Send OTP"}
            </button>

            {otpSent && (
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
                className="w-full text-[#5C7BA8] hover:text-[#1F3E72] text-sm"
              >
                Use a different email
              </button>
            )}
          </form>
        )}

        <p className="mt-8 text-center text-[#5C7BA8]">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToSignup}
            className="text-[#2F5D9F] hover:text-[#1F3E72] transition-colors"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
