"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Account created! Welcome aboard!", type: "success" });
        router.push('/')
      } else {
        setMessage({ text: data.error || "Signup failed", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Something went wrong", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-teal-500 via-emerald-600 to-cyan-700">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Floating Map Pins */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <MapPin
            key={i}
            className="absolute text-white/10 animate-bounce"
            size={36}
            style={{
              top: `${10 + i * 12}%`,
              left: `${5 + i * 12}%`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* Signup Card */}
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-full mb-4 shadow-lg">
              <MapPin className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Join the Journey</h1>
            <p className="text-teal-100">Plan your next adventure with us</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="peer w-full px-4 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-white/60 transition"
                placeholder="Name"
              />
              <label className="absolute left-4 -top-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm px-2 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-sm">
                Full Name
              </label>
            </div>

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
              <label className="absolute left-4 -top-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm px-2 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-sm">
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
              <label className="absolute left-4 -top-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm px-2 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-sm">
                Create Password
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-teal-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Start Exploring
                  <MapPin className="ml-2" />
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

          <p className="text-center text-teal-100 mt-6">
            Already exploring?{" "}
            <Link href="/login" className="font-bold text-white hover:underline">
              Log In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}