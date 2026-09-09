"use client";

import Link from "next/link";
import { useState } from "react";
import { Plane, Loader2, Copy, Check, ArrowLeft, Zap, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const DEMO_EMAIL = "tapaskundu3762@gmail.com";
const DEMO_PASSWORD = "123456";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCopy = (text: string, type: "email" | "password") => {
    navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
      toast.success("Email copied to clipboard!");
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
      toast.success("Password copied to clipboard!");
    }
  };

  const handleAutoFill = () => {
    setForm({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    toast.success("Demo credentials filled!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Login successful! Welcome back 🎉");
        setMessage({ text: "Login successful! Redirecting...", type: "success" });
        router.push("/dashboard");
      } else {
        const errorMsg = data.message || data.error || "Login failed";
        toast.error(errorMsg);
        setMessage({ text: errorMsg, type: "error" });
      }
    } catch {
      toast.error("Something went wrong logging in");
      setMessage({ text: "Something went wrong", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-800 py-12 px-4">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium backdrop-blur-md transition group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <Plane
            key={i}
            className="absolute text-white/10 animate-ping"
            size={40}
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md mx-auto z-10">
        <div className="bg-white/15 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/25 p-7 sm:p-9 space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-3 shadow-lg">
              <Plane className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h1>
            <p className="text-blue-100 text-sm mt-1">Continue your travel journey with us</p>
          </div>

          {/* ── Demo Credentials Box ── */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-amber-400/30 p-4 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Demo Login Credentials</span>
              </div>
              <button
                type="button"
                onClick={handleAutoFill}
                className="text-[11px] font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 px-2.5 py-1 rounded-lg transition shadow-sm cursor-pointer flex items-center gap-1"
                title="Fill demo email & password automatically"
              >
                <span>⚡ Auto-Fill</span>
              </button>
            </div>

            {/* Email item */}
            <div className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2 text-xs border border-white/10">
              <div className="truncate pr-2">
                <span className="text-blue-200 block text-[10px] uppercase font-semibold">Email</span>
                <span className="font-mono text-white select-all font-medium">{DEMO_EMAIL}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(DEMO_EMAIL, "email")}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 flex-shrink-0 cursor-pointer"
                title="Copy Email"
              >
                {copiedEmail ? (
                  <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-[10px] text-emerald-300">Copied</span></>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /><span className="text-[10px]">Copy</span></>
                )}
              </button>
            </div>

            {/* Password item */}
            <div className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2 text-xs border border-white/10">
              <div>
                <span className="text-blue-200 block text-[10px] uppercase font-semibold">Password</span>
                <span className="font-mono text-white select-all font-medium">{DEMO_PASSWORD}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(DEMO_PASSWORD, "password")}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 flex-shrink-0 cursor-pointer"
                title="Copy Password"
              >
                {copiedPassword ? (
                  <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-[10px] text-emerald-300">Copied</span></>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /><span className="text-[10px]">Copy</span></>
                )}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="peer w-full px-4 py-3.5 bg-white/20 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-white/70 transition text-sm"
                placeholder="Email"
              />
              <label className="absolute left-4 -top-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs px-2 py-0.5 rounded transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-xs">
                Email Address
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                className="peer w-full px-4 py-3.5 bg-white/20 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-white/70 transition text-sm"
                placeholder="Password"
              />
              <label className="absolute left-4 -top-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs px-2 py-0.5 rounded transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-xs">
                Password
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 font-extrabold text-base rounded-2xl shadow-xl shadow-orange-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Logging in…</span>
                </>
              ) : (
                <>
                  <Plane className="w-5 h-5 rotate-45" />
                  <span>Let&apos;s Fly!</span>
                </>
              )}
            </button>
          </form>

          {message && (
            <div
              className={`p-3 rounded-xl text-center text-xs font-semibold ${
                message.type === "success"
                  ? "bg-emerald-500/25 border border-emerald-400/40 text-emerald-100"
                  : "bg-red-500/25 border border-red-400/40 text-red-100"
              }`}
            >
              {message.text}
            </div>
          )}

          <p className="text-center text-blue-100 text-xs pt-1">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold text-white hover:underline ml-1">
              Sign Up Now →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}