import { useState } from "react";
import stageImg from "../Legacy/stage.jpg";
import { loginAdmin } from "../services/service";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginAdmin(username, password);
      if (!data?.token) throw new Error("Invalid backend response. Check API base URL and backend status.");

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_profile", JSON.stringify(data.admin));
      window.location.href = "/admin";
    } catch (e) {
      if (e?.status === 404) {
        setError("Backend route not found. Restart backend and ensure /api/admin/login is available.");
        return;
      }
      setError(e.message || "Login failed. Check backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-root min-h-screen relative bg-[#070b18] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img src={stageImg} alt="Stage Backdrop" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,215,0,0.12),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(170,16,16,0.22),transparent_45%)]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl border border-[#FFD700]/45 bg-[#080b16]/90 shadow-[0_0_40px_rgba(255,215,0,0.18)] p-8"
        >
          <p className="text-[#e2c4a4] text-xs tracking-[0.28em] uppercase mb-2 font-cinzel">Backstage Access</p>
          <h1 className="text-3xl font-cinzel text-[#FFD700] mb-6 uppercase tracking-[0.12em]">Admin Login</h1>

          <label className="block text-xs uppercase tracking-[0.18em] text-gray-300 mb-2">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-lg bg-black/50 border border-[#FFD700]/25 focus:outline-none focus:border-[#FFD700]"
            autoComplete="username"
          />

          <label className="block text-xs uppercase tracking-[0.18em] text-gray-300 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-2 px-4 py-3 rounded-lg bg-black/50 border border-[#FFD700]/25 focus:outline-none focus:border-[#FFD700]"
            autoComplete="current-password"
          />

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-[#5b0e0e] to-[#b10f0f] text-[#ffe7b0] uppercase tracking-[0.18em] font-semibold border border-[#d24040]/50 hover:shadow-[0_0_22px_rgba(198,39,39,0.45)] transition-all disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Enter the Wings"}
          </button>
        </form>
      </div>
      <style>{`
        .admin-login-root, .admin-login-root * {
          cursor: auto !important;
        }
      `}</style>
    </div>
  );
}
