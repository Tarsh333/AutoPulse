import { useState } from "react";
import { register } from "../api/auth";
import { updateProfile } from "../api/profile";
import PasswordInput from "./PasswordInput";

export default function SignupPage({
  onSignup,
  onSwitchToLogin
}: {
  onSignup: () => void;
  onSwitchToLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Create the main member account (stores the JWT).
      await register(name, email, password);

      // Persist the extra profile fields the backend supports.
      // Age isn't stored directly, so derive an approximate date of birth.
      let dateOfBirth: string | null = null;
      const ageNum = parseInt(age, 10);
      if (!Number.isNaN(ageNum) && ageNum > 0) {
        const birthYear = new Date().getFullYear() - ageNum;
        dateOfBirth = `${birthYear}-01-01`;
      }

      await updateProfile({ gender, dateOfBirth });

      onSignup();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAF2FB] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-12 w-full max-w-md shadow-[0_8px_30px_rgb(47,93,159,0.12)]">
        <div className="text-center mb-10">
          <h1 className="text-[#1F3E72] mb-2" style={{ fontSize: '32px' }}>AutoPulse</h1>
          <p className="text-[#5C7BA8]">Create your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[#1F3E72] mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-[#D6E4F5] rounded-xl focus:outline-none focus:border-[#2F5D9F] bg-white transition-colors"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-[#1F3E72] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-[#D6E4F5] rounded-xl focus:outline-none focus:border-[#2F5D9F] bg-white transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-[#1F3E72] mb-2">Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-[#D6E4F5] rounded-xl focus:outline-none focus:border-[#2F5D9F] bg-white transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#1F3E72] mb-2">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-[#D6E4F5] rounded-xl focus:outline-none focus:border-[#2F5D9F] bg-white transition-colors"
                placeholder="Age"
                required
              />
            </div>

            <div>
              <label className="block text-[#1F3E72] mb-2">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-[#D6E4F5] rounded-xl focus:outline-none focus:border-[#2F5D9F] bg-white transition-colors"
                required
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#2F5D9F] text-white rounded-xl hover:bg-[#1F3E72] transition-colors shadow-[0_4px_14px_rgb(47,93,159,0.25)] mt-6 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-8 text-center text-[#5C7BA8]">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-[#2F5D9F] hover:text-[#1F3E72] transition-colors"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
