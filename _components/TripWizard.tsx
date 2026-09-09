"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Plane, MapPin, Calendar, Users, DollarSign, Clock,
  Sparkles, Loader2, ChevronRight, AlertCircle, ArrowLeft, Compass,
} from "lucide-react";
import toast from "react-hot-toast";
import TripPlanRenderer from "./TripPlanRenderer";
import { useTripStore } from "@/store/useTripStore";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────
export interface TripPlan {
  destination: string;
  duration: string;
  startDate?: string;
  origin: string;
  budget: string;
  group_size: string;
  weather_note?: string;
  hotels: Array<{
    hotel_name: string;
    hotel_address: string;
    price_per_night: string;
    hotel_image_url: string;
    geo_coordinates: { latitude: number; longitude: number };
    rating: number;
    description: string;
  }>;
  itinerary: Array<{
    day: number;
    day_plan: string;
    best_time_to_visit_day: string;
    activities: Array<{
      place_name: string;
      place_details: string;
      place_image_url: string;
      geo_coordinates: { latitude: number; longitude: number };
      place_address: string;
      ticket_pricing: string;
      time_travel_each_location: string;
      best_time_to_visit: string;
    }>;
  }>;
}

// ─── Card Option ─────────────────────────────────────────
interface CardOptionProps {
  value: string;
  selected: boolean;
  onSelect: (v: string) => void;
  disabled: boolean;
  emoji: string;
  label: string;
  desc?: string;
  activeClass: string;
}

function CardOption({ value, selected, onSelect, disabled, emoji, label, desc, activeClass }: CardOptionProps) {
  const base = "relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const idle = "bg-white/5 border-white/20 hover:border-white/40 hover:bg-white/10 hover:scale-105";
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      disabled={disabled}
      className={[base, selected ? activeClass : idle].join(" ")}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <span className="text-3xl leading-none">{emoji}</span>
      <span className={"font-bold text-sm " + (selected ? "text-white" : "text-white/80")}>{label}</span>
      {desc && <span className="text-xs text-white/50 leading-tight">{desc}</span>}
    </button>
  );
}

// ─── Generating Overlay ───────────────────────────────────
function GeneratingOverlay({ destination }: { destination: string }) {
  const [step, setStep] = useState(0);
  const steps = [
    "Analysing destination",
    "Finding best hotels",
    "Crafting your itinerary",
    "Planning daily activities",
    "Adding local tips",
    "Finalising your dream trip",
  ];
  useEffect(() => {
    const id = setInterval(() => setStep(p => (p < steps.length - 1 ? p + 1 : p)), 4000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 px-4">
      {/* Spinner */}
      <div className="relative mb-8">
        <div
          className="w-28 h-28 rounded-full border-4 border-indigo-500/30 animate-spin"
          style={{ borderTopColor: "#6366f1", animationDuration: "1.2s" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Plane className="w-10 h-10 text-indigo-400 animate-bounce" />
        </div>
      </div>
      {/* Destination badge */}
      <div className="flex items-center gap-2 mb-2 bg-white/10 backdrop-blur px-5 py-2 rounded-full border border-white/20">
        <MapPin className="w-4 h-4 text-orange-400" />
        <span className="text-white font-semibold text-sm">{destination}</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-1 mt-3">Planning your trip</h2>
      <p className="text-indigo-300 text-sm mb-8">This takes 15 to 30 seconds</p>
      {/* Steps */}
      <div className="space-y-2 w-72">
        {steps.map((s, i) => (
          <div
            key={s}
            className={[
              "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-500",
              i === step
                ? "bg-indigo-600/50 border border-indigo-400/50 scale-105"
                : i < step ? "opacity-40" : "opacity-20",
            ].join(" ")}
          >
            {i < step ? (
              <div className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : i === step ? (
              <Loader2 className="w-4 h-4 text-indigo-300 animate-spin flex-shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-white/30 flex-shrink-0" />
            )}
            <span className={"text-sm font-medium " + (i === step ? "text-white" : "text-indigo-300")}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Wizard ─────────────────────────────────────────
const TripWizard = () => {
  const searchParams = useSearchParams();
  const { setCurrentPlan, currentPlan } = useTripStore();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [budget, setBudget] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill destination from URL query
  useEffect(() => {
    const msg = searchParams.get("message");
    if (msg) {
      const match = msg.match(/(?:to|in|for)\s+([A-Za-z\s]+?)(?:\s|$)/i);
      if (match?.[1]) setDestination(match[1].trim());
    }
  }, [searchParams]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!origin.trim()) errs.origin = "Please enter your starting location";
    if (!destination.trim()) errs.destination = "Please enter a destination";
    if (!duration) errs.duration = "Please select a trip duration";
    if (!groupSize) errs.groupSize = "Please select who is travelling";
    if (!budget) errs.budget = "Please select a budget level";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGenerate = useCallback(async () => {
    if (!validate()) { toast.error("Please fill in all required fields"); return; }
    setIsGenerating(true);
    setCurrentPlan(null);
    try {
      const res = await fetch("/api/ai/generate-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination, startDate, duration, groupSize, budget }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to generate trip");
      setCurrentPlan(data.trip_plan);
      toast.success("Your trip plan is ready!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, destination, startDate, duration, groupSize, budget, setCurrentPlan]);

  const handleNewTrip = () => {
    setCurrentPlan(null);
    setOrigin(""); setDestination(""); setStartDate("");
    setDuration(""); setGroupSize(""); setBudget(""); setErrors({});
  };

  // ── When plan ready: show full result ──
  if (currentPlan) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar back to Landing Page & Dashboard */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 sm:px-8 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-indigo-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Link>
              <button
                onClick={handleNewTrip}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-xl transition"
              >
                <Sparkles className="w-4 h-4" /> Edit & Plan Another
              </button>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition"
            >
              <Compass className="w-4 h-4" /> My Dashboard
            </Link>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <TripPlanRenderer plan={currentPlan} onNewChat={handleNewTrip} />
        </div>
      </div>
    );
  }

  const DURATION_OPTS = [
    { value: "3 days",  emoji: "⚡", label: "3 Days",   desc: "Quick escape" },
    { value: "5 days",  emoji: "🌟", label: "5 Days",   desc: "Long weekend" },
    { value: "7 days",  emoji: "🗓️", label: "1 Week",   desc: "Full week" },
    { value: "10 days", emoji: "🌍", label: "10+ Days", desc: "Extended trip" },
  ];
  const GROUP_OPTS = [
    { value: "Solo",    emoji: "🧍", label: "Solo",    desc: "Just me" },
    { value: "Couple",  emoji: "👫", label: "Couple",  desc: "2 people" },
    { value: "Family",  emoji: "👨‍👩‍👧", label: "Family",  desc: "With kids" },
    { value: "Friends", emoji: "👥", label: "Friends", desc: "Group trip" },
  ];
  const BUDGET_OPTS = [
    { value: "Low",    emoji: "💚", label: "Budget",  desc: "Hostels + street food",  activeClass: "bg-emerald-600 border-emerald-400 ring-2 ring-emerald-500 text-white scale-105 shadow-lg" },
    { value: "Medium", emoji: "💛", label: "Comfort", desc: "3-star + local dining",  activeClass: "bg-amber-500 border-amber-400 ring-2 ring-amber-400 text-white scale-105 shadow-lg" },
    { value: "High",   emoji: "💎", label: "Luxury",  desc: "5-star + fine dining",   activeClass: "bg-violet-600 border-violet-400 ring-2 ring-violet-500 text-white scale-105 shadow-lg" },
  ];
  const POPULAR = ["Paris", "Tokyo", "Bali", "New York", "Singapore", "Shimla", "Goa"];
  const SHARED_ACTIVE = "bg-indigo-600 border-indigo-400 ring-2 ring-indigo-500 text-white scale-105 shadow-lg";
  const CYAN_ACTIVE   = "bg-cyan-600 border-cyan-400 ring-2 ring-cyan-500 text-white scale-105 shadow-lg";

  return (
    <>
      {isGenerating && <GeneratingOverlay destination={destination} />}

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 relative overflow-hidden">
        {/* ── Top Navigation Bar: Back to Landing Page ── */}
        <header className="relative z-20 border-b border-white/10 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-3.5">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/85 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition shadow-sm group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </Link>

            <Link href="/" className="flex items-center gap-2 font-bold text-base sm:text-lg text-white">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center text-white text-sm sm:text-base font-black shadow-md">
                ✈
              </span>
              <span className="tracking-tight hidden xs:inline">AI Trip Planner</span>
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-indigo-200 hover:text-white bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/30 px-3 sm:px-4 py-2 rounded-xl transition shadow-sm"
            >
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>My Trips</span>
            </Link>
          </div>
        </header>

        {/* Glow blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 sm:py-16">

          {/* ── Header ── */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-indigo-600/20 backdrop-blur border border-indigo-500/30 px-4 py-2 rounded-full text-indigo-300 text-sm font-medium mb-5">
              <Sparkles className="w-4 h-4" /> AI-Powered Trip Planner
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-3">
              Plan Your{" "}
              <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                Dream Trip
              </span>
            </h1>
            <p className="text-indigo-300 text-lg">
              Tell us your preferences and we will craft a personalised itinerary instantly.
            </p>
          </div>

          {/* ── Form Card ── */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">

            {/* From / To */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-indigo-200 mb-2">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  From (Your City) <span className="text-red-400">*</span>
                </label>
                <input
                  id="wizard-origin"
                  type="text"
                  value={origin}
                  onChange={e => { setOrigin(e.target.value); setErrors(p => ({ ...p, origin: "" })); }}
                  placeholder="e.g. New Delhi, Mumbai"
                  className={[
                    "w-full px-4 py-3 rounded-xl bg-white/10 border text-white placeholder-white/40 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition text-sm",
                    errors.origin ? "border-red-500" : "border-white/20",
                  ].join(" ")}
                />
                {errors.origin && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.origin}
                  </p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-indigo-200 mb-2">
                  <Plane className="w-4 h-4 text-orange-400" />
                  To (Destination) <span className="text-red-400">*</span>
                </label>
                <input
                  id="wizard-destination"
                  type="text"
                  value={destination}
                  onChange={e => { setDestination(e.target.value); setErrors(p => ({ ...p, destination: "" })); }}
                  placeholder="e.g. Bali, Paris, Tokyo"
                  className={[
                    "w-full px-4 py-3 rounded-xl bg-white/10 border text-white placeholder-white/40 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition text-sm",
                    errors.destination ? "border-red-500" : "border-white/20",
                  ].join(" ")}
                />
                {errors.destination && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.destination}
                  </p>
                )}
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-indigo-200 mb-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                Travel Start Date{" "}
                <span className="text-white/40 text-xs font-normal ml-1">(optional)</span>
              </label>
              <input
                id="wizard-date"
                type="date"
                value={startDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => setStartDate(e.target.value)}
                className="w-full sm:w-64 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-indigo-400 transition text-sm [color-scheme:dark]"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-indigo-200 mb-3">
                <Clock className="w-4 h-4 text-orange-400" />
                Trip Duration <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DURATION_OPTS.map(opt => (
                  <CardOption
                    key={opt.value}
                    value={opt.value}
                    selected={duration === opt.value}
                    onSelect={v => { setDuration(v); setErrors(p => ({ ...p, duration: "" })); }}
                    disabled={isGenerating}
                    emoji={opt.emoji}
                    label={opt.label}
                    desc={opt.desc}
                    activeClass={SHARED_ACTIVE}
                  />
                ))}
              </div>
              {errors.duration && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.duration}
                </p>
              )}
            </div>

            {/* Group Size */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-indigo-200 mb-3">
                <Users className="w-4 h-4 text-orange-400" />
                Who is Travelling? <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {GROUP_OPTS.map(opt => (
                  <CardOption
                    key={opt.value}
                    value={opt.value}
                    selected={groupSize === opt.value}
                    onSelect={v => { setGroupSize(v); setErrors(p => ({ ...p, groupSize: "" })); }}
                    disabled={isGenerating}
                    emoji={opt.emoji}
                    label={opt.label}
                    desc={opt.desc}
                    activeClass={CYAN_ACTIVE}
                  />
                ))}
              </div>
              {errors.groupSize && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.groupSize}
                </p>
              )}
            </div>

            {/* Budget */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-indigo-200 mb-3">
                <DollarSign className="w-4 h-4 text-orange-400" />
                Budget Level <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {BUDGET_OPTS.map(opt => (
                  <CardOption
                    key={opt.value}
                    value={opt.value}
                    selected={budget === opt.value}
                    onSelect={v => { setBudget(v); setErrors(p => ({ ...p, budget: "" })); }}
                    disabled={isGenerating}
                    emoji={opt.emoji}
                    label={opt.label}
                    desc={opt.desc}
                    activeClass={opt.activeClass}
                  />
                ))}
              </div>
              {errors.budget && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.budget}
                </p>
              )}
            </div>

            {/* Generate Button */}
            <div className="pt-2">
              <button
                id="wizard-generate-btn"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 px-8 rounded-2xl font-extrabold text-lg text-white bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 hover:from-orange-600 hover:via-pink-600 hover:to-violet-700 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <><Loader2 className="w-6 h-6 animate-spin" /> Generating your trip...</>
                ) : (
                  <><Sparkles className="w-6 h-6" /> Generate My Trip Plan <ChevronRight className="w-6 h-6" /></>
                )}
              </button>
              <p className="text-center text-white/40 text-xs mt-3">
                Takes 15 to 30 seconds · Powered by AI
              </p>
            </div>
          </div>

          {/* Popular destinations */}
          <div className="mt-8 text-center">
            <p className="text-white/40 text-xs mb-3">Popular destinations</p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR.map(d => (
                <button
                  key={d}
                  onClick={() => setDestination(d)}
                  className="px-3 py-1.5 text-xs text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TripWizard;
