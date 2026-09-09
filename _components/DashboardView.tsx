"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MapPin, Calendar, Users, Wallet, ArrowLeft, Plane, Hotel,
  Search, Trash2, Eye, Plus, Sparkles, LogOut, LogIn,
  ShieldCheck, ExternalLink, Compass, Clock, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TripItem {
  _id: string;
  destination: string;
  duration: string;
  budget: string;
  group_size: string;
  origin: string;
  createdAt?: string;
  hotels?: Array<{
    hotel_name: string;
    hotel_address: string;
    price_per_night: string;
    hotel_image_url?: string;
    rating: number;
  }>;
  itinerary?: Array<{
    day: number;
    day_plan: string;
    activities: Array<any>;
  }>;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  isPurchased?: boolean;
  createdAt?: string;
}

const DESTINATION_GRADIENTS: Record<string, string> = {
  paris: "from-rose-500 to-indigo-700",
  tokyo: "from-red-500 to-violet-700",
  bali: "from-emerald-500 to-teal-700",
  "new york": "from-blue-600 to-slate-800",
  singapore: "from-amber-500 to-rose-600",
  shimla: "from-cyan-500 to-blue-700",
  goa: "from-orange-400 to-amber-600",
  dubai: "from-amber-400 to-yellow-600",
  london: "from-indigo-600 to-slate-800",
};

export default function DashboardView() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteTrip, setConfirmDeleteTrip] = useState<TripItem | null>(null);

  // 1. Fetch user profile and saved trips
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Load User profile
        try {
          const userRes = await axios.get("/api/auth/me");
          if (userRes.data?.success && userRes.data.user) {
            setUser(userRes.data.user);
          }
        } catch {
          // User not logged in
          setUser(null);
        }

        // Load Saved Trips
        try {
          const tripsRes = await axios.get("/api/getViewAllTrips", {
            withCredentials: true,
          });
          if (tripsRes.data?.success && Array.isArray(tripsRes.data.trips)) {
            setTrips(tripsRes.data.trips);
          } else {
            setTrips([]);
          }
        } catch (tripErr: any) {
          if (tripErr?.response?.status === 401) {
            // Not authenticated
            setTrips([]);
          } else {
            setTrips([]);
          }
        }
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    }

    loadDashboardData();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await axios.get("/api/auth/logout");
      setUser(null);
      setTrips([]);
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  // Handle Delete Trip
  const handleDeleteTrip = async (id: string) => {
    try {
      setDeletingId(id);
      const res = await axios.delete(`/api/deleteTrip/${id}`);
      if (res.data?.success) {
        setTrips(prev => prev.filter(t => t._id !== id));
        toast.success("Trip removed from saved history");
        setConfirmDeleteTrip(null);
      } else {
        toast.error(res.data?.message || "Could not delete trip");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete trip");
    } finally {
      setDeletingId(null);
    }
  };

  // Metrics calculation
  const stats = useMemo(() => {
    const totalTrips = trips.length;
    const uniqueDestinations = new Set(trips.map(t => t.destination.toLowerCase().trim())).size;

    // Calculate total days
    const totalDays = trips.reduce((acc, t) => {
      const match = t.duration?.match(/(\d+)/);
      const days = match ? parseInt(match[1]) : 3;
      return acc + (isNaN(days) ? 3 : days);
    }, 0);

    // Most common budget tier
    const budgetCounts: Record<string, number> = {};
    trips.forEach(t => {
      const b = t.budget || "Medium";
      budgetCounts[b] = (budgetCounts[b] || 0) + 1;
    });
    let topBudget = "Comfort";
    let maxB = 0;
    Object.entries(budgetCounts).forEach(([b, count]) => {
      if (count > maxB) {
        maxB = count;
        topBudget = b;
      }
    });

    return { totalTrips, uniqueDestinations, totalDays, topBudget };
  }, [trips]);

  // Filter and sort trips
  const filteredTrips = useMemo(() => {
    return trips
      .filter(t => {
        // Search
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          t.destination.toLowerCase().includes(q) ||
          t.origin?.toLowerCase().includes(q);

        // Budget filter
        const matchesBudget =
          budgetFilter === "all" ||
          t.budget?.toLowerCase() === budgetFilter.toLowerCase();

        // Duration filter
        let matchesDuration = true;
        const match = t.duration?.match(/(\d+)/);
        const days = match ? parseInt(match[1]) : 3;
        if (durationFilter === "short") {
          matchesDuration = days <= 5;
        } else if (durationFilter === "long") {
          matchesDuration = days > 5;
        }

        return matchesSearch && matchesBudget && matchesDuration;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        } else {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        }
      });
  }, [trips, searchQuery, budgetFilter, durationFilter, sortBy]);

  const getGradient = (destination: string) => {
    const key = destination.toLowerCase().trim();
    for (const [city, grad] of Object.entries(DESTINATION_GRADIENTS)) {
      if (key.includes(city)) return grad;
    }
    return "from-indigo-600 via-purple-600 to-pink-600";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* ── Top Header Navigation ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Home</span>
            </Link>

            <Link href="/" className="flex items-center gap-2 font-bold text-base sm:text-lg text-slate-900 pl-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center text-white text-base font-black shadow-sm">
                ✈
              </span>
              <span className="tracking-tight hidden sm:inline">AI Trip Planner</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => router.push("/create-new-trip")}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm px-3.5 sm:px-5 py-2 rounded-xl shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Plan New Trip
            </Button>

            {user ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200 px-3 py-2 rounded-xl transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Log out</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* ── User Welcome & Profile Banner ── */}
        <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-indigo-500/30 border border-indigo-400/30 px-3.5 py-1 rounded-full text-xs font-semibold text-indigo-200">
                <Compass className="w-3.5 h-3.5 text-indigo-400" /> Traveler Dashboard
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {user ? (
                  <>Welcome back, <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">{user.name}</span>! 👋</>
                ) : (
                  <>Your <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">Trip History</span> & Stored Plans</>
                )}
              </h1>
              <p className="text-indigo-200 text-sm sm:text-base max-w-2xl leading-relaxed">
                Manage your saved AI travel plans, explore destination itineraries, and book verified flights and hotels with Booking.com.
              </p>
              {user && (
                <div className="flex items-center gap-4 text-xs text-indigo-300 pt-2">
                  <span>✉ {user.email}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Account
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3">
              <Button
                onClick={() => router.push("/create-new-trip")}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold px-6 py-6 rounded-2xl shadow-lg shadow-orange-500/20 transition transform hover:scale-105"
              >
                <Sparkles className="w-5 h-5 mr-2" /> Plan Next Trip
              </Button>
            </div>
          </div>
        </section>

        {/* ── Guest Warning if Not Logged In ── */}
        {!user && authChecked && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-900">Sign in to save and access your personal trip history</h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Logged-in travelers can save unlimited trip itineraries, download offline PDFs, and manage bookings anytime.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={() => router.push("/login")}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                Log In
              </Button>
              <Button
                onClick={() => router.push("/signup")}
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-800 hover:bg-amber-100"
              >
                Create Account
              </Button>
            </div>
          </div>
        )}

        {/* ── Metric Stats Row ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Trips</span>
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.totalTrips}</p>
            <p className="text-xs text-slate-400 mt-1">Saved AI itineraries</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Destinations</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <Plane className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.uniqueDestinations}</p>
            <p className="text-xs text-slate-400 mt-1">Unique cities explored</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Travel Days</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.totalDays}</p>
            <p className="text-xs text-slate-400 mt-1">Planned vacation days</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preferred Style</span>
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.topBudget}</p>
            <p className="text-xs text-slate-400 mt-1">Most chosen budget tier</p>
          </div>
        </section>

        {/* ── Booking.com Fast Access Hub Banner ── */}
        <section className="bg-gradient-to-r from-[#003580] to-[#00224f] rounded-2xl p-5 sm:p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xl text-yellow-300 border border-white/20 flex-shrink-0">
              B.
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider">Booking.com Integration</span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-blue-200">Official Partner Links</span>
              </div>
              <h3 className="text-lg font-bold">Ready to Book Flights & Hotels?</h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Every saved trip in your dashboard features direct 1-click links to live flight and accommodation prices.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <a
              href="https://www.booking.com/flights/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-[#003580] text-xs font-extrabold rounded-xl shadow-sm transition transform hover:scale-105"
            >
              <Plane className="w-3.5 h-3.5" /> Book Flights ↗
            </a>
            <a
              href="https://www.booking.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition"
            >
              <Hotel className="w-3.5 h-3.5" /> Search Hotels ↗
            </a>
          </div>
        </section>

        {/* ── Search, Filters & Controls Bar ── */}
        <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search saved trips by destination or origin..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort & Quick actions */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as "newest" | "oldest")}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="newest">Newest Saved</option>
                <option value="oldest">Oldest Saved</option>
              </select>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 mr-1">Filter Budget:</span>
            {["all", "Low", "Medium", "High"].map(b => (
              <button
                key={b}
                onClick={() => setBudgetFilter(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  budgetFilter === b
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {b === "all" ? "All Budgets" : b}
              </button>
            ))}

            <span className="text-xs font-semibold text-slate-400 ml-3 mr-1">Duration:</span>
            {[
              { id: "all", label: "All" },
              { id: "short", label: "≤ 5 Days" },
              { id: "long", label: "7+ Days" },
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDurationFilter(d.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  durationFilter === d.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Saved Trips List ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>Saved Itineraries</span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                {filteredTrips.length} {filteredTrips.length === 1 ? "Trip" : "Trips"}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Loading your trip plans…</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-16 border border-slate-200 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl font-black">
                ✈
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                {searchQuery || budgetFilter !== "all" || durationFilter !== "all"
                  ? "No trips matched your search filter"
                  : "You haven't saved any trips yet"}
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {searchQuery || budgetFilter !== "all" || durationFilter !== "all"
                  ? "Try adjusting your search keyword or clearing the filters above."
                  : "Tell our AI where you want to go and receive a comprehensive custom itinerary with hotel picks and maps in 15 seconds."}
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => router.push("/create-new-trip")}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold px-6 py-3 rounded-xl shadow-md transition"
                >
                  <Plus className="w-4 h-4 mr-2" /> Plan Your First Trip Now
                </Button>
              </div>

              {/* Popular destination shortcuts */}
              <div className="pt-6 border-t border-slate-100 max-w-lg mx-auto">
                <p className="text-xs font-semibold text-slate-400 mb-2">Need inspiration? Try planning for:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["Paris", "Tokyo", "Bali", "Goa", "Dubai"].map(city => (
                    <button
                      key={city}
                      onClick={() => router.push(`/create-new-trip?message=Trip to ${city}`)}
                      className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition border border-slate-200"
                    >
                      {city} →
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map(item => {
                const gradient = getGradient(item.destination);
                const hotelCount = item.hotels?.length || 0;
                const daysCount = item.itinerary?.length || 0;
                const dateStr = item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : null;

                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
                  >
                    {/* Destination Banner */}
                    <div className={`relative h-40 bg-gradient-to-r ${gradient} p-5 flex flex-col justify-between text-white overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/15 pointer-events-none" />

                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                          {item.duration || "Trip"}
                        </span>
                        <button
                          onClick={() => setConfirmDeleteTrip(item)}
                          className="w-8 h-8 rounded-full bg-black/30 hover:bg-red-600/80 text-white flex items-center justify-center transition border border-white/20"
                          title="Delete trip from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-1.5 text-xs text-white/90 mb-1">
                          <span>{item.origin || "Origin"}</span>
                          <span className="text-xs">➔</span>
                          <span className="font-semibold">{item.destination}</span>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
                          {item.destination}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex flex-col flex-1 space-y-4">
                      {/* Badges row */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          <Wallet className="w-3 h-3" /> {item.budget} Budget
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                          <Users className="w-3 h-3" /> {item.group_size}
                        </span>
                        {hotelCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                            <Hotel className="w-3 h-3" /> {hotelCount} Hotels
                          </span>
                        )}
                        {daysCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                            <Calendar className="w-3 h-3" /> {daysCount} Days
                          </span>
                        )}
                      </div>

                      {/* Saved date if available */}
                      {dateStr && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Saved on {dateStr}
                        </p>
                      )}

                      {/* Booking.com Fast Links */}
                      <div className="bg-[#003580]/5 rounded-xl p-3 border border-[#003580]/15 space-y-2 mt-auto">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#003580]">
                          <span className="flex items-center gap-1">
                            <span className="font-black text-yellow-500">B.</span> Booking.com Links
                          </span>
                          <span className="text-[10px] text-slate-400">Live Rates</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={`https://www.booking.com/flights/index.html?from=${encodeURIComponent(item.origin || "")}&to=${encodeURIComponent(item.destination)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 py-1.5 px-2 bg-yellow-400 hover:bg-yellow-500 text-[#003580] text-xs font-bold rounded-lg transition"
                          >
                            <Plane className="w-3 h-3" /> Flights ↗
                          </a>
                          <a
                            href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(item.destination)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-[#003580] text-xs font-bold rounded-lg border border-slate-200 transition"
                          >
                            <Hotel className="w-3 h-3" /> Hotels ↗
                          </a>
                        </div>
                      </div>

                      {/* Card Action Button */}
                      <div className="pt-2">
                        <Button
                          onClick={() => router.push(`/my-trips/${item._id}`)}
                          className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-sm"
                        >
                          <Eye className="w-4 h-4" /> View Full Itinerary
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ── Confirmation Modal for Deleting Trip ── */}
      {confirmDeleteTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Delete Trip to {confirmDeleteTrip.destination}?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove this trip from your saved history? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteTrip(null)}
                className="flex-1 py-2.5 rounded-xl border-slate-200 text-slate-700"
                disabled={deletingId === confirmDeleteTrip._id}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteTrip(confirmDeleteTrip._id)}
                disabled={deletingId === confirmDeleteTrip._id}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                {deletingId === confirmDeleteTrip._id ? "Deleting…" : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
