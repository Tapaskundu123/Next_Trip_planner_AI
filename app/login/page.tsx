"use client";

import Link from "next/link";
import { useState } from "react";
import { Plane, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const router= useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
        setMessage({ text: "Login successful! Redirecting...", type: "success" });
        // redirect logic here later
        router.push('/')
      } else {
        setMessage({ text: data.error || "Login failed", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Something went wrong", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-800">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
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
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4 shadow-lg">
              <Plane className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-blue-100">Continue your journey with us</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="peer w-full px-4 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-white/60 transition"
                placeholder="Email"
              />
              <label className="absolute left-4 -top-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm px-2 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-sm">
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
                className="peer w-full px-4 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-white/60 transition"
                placeholder="Password"
              />
              <label className="absolute left-4 -top-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm px-2 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-sm">
                Password
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <Plane className="rotate-45" />
                  Let's Fly!
                </>
              )}
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg text-center font-medium ${
                message.type === "success" ? "bg-green-500/20 text-green-100" : "bg-red-500/20 text-red-100"
              }`}
            >
              {message.text}
            </div>
          )}

          <p className="text-center text-blue-100 mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="font-bold text-white hover:underline">
              Sign Up Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}