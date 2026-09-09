'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plane, MapPin, Sparkles, Star,
  Clock, Wallet, Brain, Map, FileText, Mic,
  CheckCircle, ChevronRight, ChevronLeft, ArrowRight, Zap, Shield,
  MessageSquare, Package, TrendingUp, Pause, Play, ExternalLink,
  Camera, Compass
} from 'lucide-react';

interface DestinationBg {
  id: string;
  name: string;
  country: string;
  emoji: string;
  tagline: string;
  suggestedPrompt: string;
  budgetTag: string;
  durationTag: string;
  imageUrl: string;
  photographer: string;
  photographerUrl: string;
}

const DESTINATIONS: DestinationBg[] = [
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    emoji: "🏝️",
    tagline: "Tropical beaches, lush rice terraces & sacred cliffside temples",
    suggestedPrompt: "7-day tropical getaway to Bali with beachfront villas, Ubud cultural tour and sunset dinners",
    budgetTag: "Budget to Luxury",
    durationTag: "5 - 7 Days",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2000&q=85",
    photographer: "Sebastien Gabriel",
    photographerUrl: "https://unsplash.com/@sebastien_g",
  },
  {
    id: "swiss-alps",
    name: "Swiss Alps",
    country: "Switzerland",
    emoji: "🏔️",
    tagline: "Dramatic snow peaks, scenic Glacier Express trains & crystal alpine lakes",
    suggestedPrompt: "5-day scenic rail journey across Switzerland exploring Zermatt, Interlaken and fondue dining",
    budgetTag: "Comfort to Luxury",
    durationTag: "4 - 6 Days",
    imageUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=2000&q=85",
    photographer: "Dino Reichmuth",
    photographerUrl: "https://unsplash.com/@dinoreichmuth",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    emoji: "⛩️",
    tagline: "Electrifying neon skylines, ancient shrines & world-class gastronomy",
    suggestedPrompt: "7 days in Tokyo discovering Shibuya, Akihabara, Asakusa temples and authentic sushi spots",
    budgetTag: "Moderate to High",
    durationTag: "7 - 10 Days",
    imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=2000&q=85",
    photographer: "Jezael Melgoza",
    photographerUrl: "https://unsplash.com/@jezael",
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    emoji: "🗼",
    tagline: "Timeless Haussmann boulevards, world-class art & romantic bistro terraces",
    suggestedPrompt: "Romantic 4-day weekend in Paris with Eiffel Tower views, Louvre museum and Seine evening river cruise",
    budgetTag: "Comfort & Style",
    durationTag: "4 - 5 Days",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=2000&q=85",
    photographer: "Chris Karidis",
    photographerUrl: "https://unsplash.com/@chriskaridis",
  },
  {
    id: "santorini",
    name: "Santorini",
    country: "Greece",
    emoji: "🇬🇷",
    tagline: "Iconic whitewashed caldera cliffs, blue domes & world-famous sunsets",
    suggestedPrompt: "5-day Greek island vacation in Santorini with sunset caldera dining and catamaran sailing tour",
    budgetTag: "Mid to High",
    durationTag: "5 - 7 Days",
    imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=2000&q=85",
    photographer: "Helena Yankovska",
    photographerUrl: "https://unsplash.com/@yankovska",
  },
  {
    id: "amalfi",
    name: "Amalfi Coast",
    country: "Italy",
    emoji: "🍋",
    tagline: "Pastel cliffside villages, azure Mediterranean waters & coastal drives",
    suggestedPrompt: "6-day road trip through Positano, Amalfi and Capri with cliffside dining and boat rentals",
    budgetTag: "Luxury & Romance",
    durationTag: "5 - 7 Days",
    imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=2000&q=85",
    photographer: "Riccardo Chiarini",
    photographerUrl: "https://unsplash.com/@riccardoch",
  },
];

const features = [
  { iconKey: 'Brain', title: 'AI-Powered Itineraries', description: 'Describe your dream trip and our AI builds a personalised day-by-day itinerary in seconds.', gradient: 'from-violet-500 to-purple-600', badge: 'Core Feature' },
  { iconKey: 'Map', title: 'Interactive Trip Map', description: 'Visualise your entire journey on a real-time interactive map with pinned hotels and attractions.', gradient: 'from-blue-500 to-cyan-500', badge: undefined },
  { iconKey: 'Wallet', title: 'Smart Budget Planner', description: 'Set your budget and get a detailed cost breakdown covering accommodation, food, and transport.', gradient: 'from-emerald-500 to-teal-500', badge: undefined },
  { iconKey: 'Package', title: 'Packing List Generator', description: 'Get a customised packing list based on your destination, weather and trip duration.', gradient: 'from-orange-500 to-amber-500', badge: undefined },
  { iconKey: 'Mic', title: 'Voice Input', description: 'Just speak your travel ideas out loud. Our voice recognition converts your words into a full trip plan.', gradient: 'from-rose-500 to-pink-500', badge: 'New' },
  { iconKey: 'FileText', title: 'Document Manager', description: 'Upload passports, visas and travel docs. The AI extracts key details for your planning.', gradient: 'from-slate-500 to-gray-600', badge: undefined },
];

const stats = [
  { value: '50K+', label: 'Trips Planned' },
  { value: '120+', label: 'Countries Covered' },
  { value: '4.9 ★', label: 'Average Rating' },
  { value: '<10s', label: 'Plan Generated' },
];

const testimonials = [
  { name: 'Priya Sharma', location: 'Mumbai, India', avatar: 'https://i.pravatar.cc/80?img=47', rating: 5, text: 'Planned my entire Europe trip in under 5 minutes! The AI suggested places I had never discovered myself.' },
  { name: 'James Kowalski', location: 'Chicago, USA', avatar: 'https://i.pravatar.cc/80?img=12', rating: 5, text: 'The budget breakdown was spot-on. We stayed within budget and still had the trip of a lifetime in Southeast Asia.' },
  { name: 'Yuki Tanaka', location: 'Tokyo, Japan', avatar: 'https://i.pravatar.cc/80?img=26', rating: 5, text: 'The interactive map and day-by-day itinerary made navigating a new country so effortless.' },
];

const steps = [
  { title: 'Describe Your Trip', description: 'Tell the AI where you want to go, your budget, travel style and dates in plain English.' },
  { title: 'AI Builds Your Plan', description: 'Within seconds you get a detailed itinerary with hotels, activities and transport options.' },
  { title: 'Explore and Customise', description: 'View your trip on an interactive map, tweak anything and chat with AI for alternatives.' },
  { title: 'Travel with Confidence', description: 'Download your complete trip plan, packing list and budget breakdown before you take off.' },
];

function FeatureIcon({ iconKey }: { iconKey: string }) {
  const cls = 'w-7 h-7';
  if (iconKey === 'Brain') return <Brain className={cls} />;
  if (iconKey === 'Map') return <Map className={cls} />;
  if (iconKey === 'Wallet') return <Wallet className={cls} />;
  if (iconKey === 'Package') return <Package className={cls} />;
  if (iconKey === 'Mic') return <Mic className={cls} />;
  if (iconKey === 'FileText') return <FileText className={cls} />;
  return null;
}

function StepIcon({ index }: { index: number }) {
  const cls = 'w-8 h-8';
  if (index === 0) return <MessageSquare className={cls} />;
  if (index === 1) return <Sparkles className={cls} />;
  if (index === 2) return <Map className={cls} />;
  return <CheckCircle className={cls} />;
}

export default function LandingPage() {
  const router = useRouter();
  const [tripInput, setTripInput] = useState('');
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [destinations, setDestinations] = useState<DestinationBg[]>(DESTINATIONS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Fetch live Unsplash photos for each destination if key available
  useEffect(() => {
    const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_KEY;
    if (!accessKey) return;

    async function fetchLiveUnsplashPhotos() {
      try {
        const updated = await Promise.all(
          DESTINATIONS.map(async (d) => {
            try {
              const res = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(d.name + ' landmark travel landscape')}&orientation=landscape&per_page=1&client_id=${accessKey}`
              );
              const data = await res.json();
              const photo = data?.results?.[0];
              if (photo?.urls?.regular) {
                return {
                  ...d,
                  imageUrl: photo.urls.regular,
                  photographer: photo.user?.name || d.photographer,
                  photographerUrl: photo.user?.links?.html || d.photographerUrl,
                };
              }
            } catch {
              // fallback to curated
            }
            return d;
          })
        );
        setDestinations(updated);
      } catch {
        // use default
      }
    }

    fetchLiveUnsplashPhotos();
  }, []);

  // Auto-play slideshow timer
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % destinations.length);
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, destinations.length]);

  const currentDest = destinations[currentIndex];

  const handleSelectDestination = (index: number) => {
    setCurrentIndex(index);
    setTripInput(destinations[index].suggestedPrompt);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? destinations.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % destinations.length);
  };

  const goToChat = (message: string) => {
    if (!message.trim()) return;
    router.push('/create-new-trip?message=' + encodeURIComponent(message));
  };

  return (
    <div className="overflow-x-hidden bg-slate-950 text-white">

      {/* ── HERO SECTION WITH INTERACTIVE UNSPLASH BACKGROUND ── */}
      <section className="relative min-h-[92vh] flex flex-col justify-between px-4 pt-20 pb-8 overflow-hidden">
        {/* Background Images with smooth Cross-fade */}
        <div className="absolute inset-0 z-0">
          {destinations.map((dest, idx) => (
            <div
              key={dest.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
              style={{
                transitionProperty: 'opacity, transform',
                transitionDuration: '1200ms, 8000ms',
              }}
            >
              <img
                src={dest.imageUrl}
                alt={dest.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}

          {/* Vignette Gradients for Maximum Text Legibility & Contrast */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(10, 15, 30, 0.82) 0%, rgba(15, 23, 42, 0.65) 45%, rgba(10, 15, 30, 0.96) 100%)',
            }}
          />
          {/* Subtle noise/grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        {/* Top Active Destination Pill */}
        <div className="relative z-10 max-w-5xl mx-auto w-full pt-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/70 border border-white/20 text-xs text-white backdrop-blur-md shadow-lg animate-in fade-in duration-300">
            <span className="text-base leading-none">{currentDest.emoji}</span>
            <span className="font-bold text-amber-300">{currentDest.name}</span>
            <span className="text-white/60">•</span>
            <span className="text-white/80 hidden sm:inline">{currentDest.country}</span>
            <span className="text-white/40 hidden md:inline">({currentDest.durationTag})</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-900/70 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full text-xs text-white/80">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Backgrounds powered by <strong>Unsplash API</strong></span>
          </div>
        </div>

        {/* Center Hero Content */}
        <div
          className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto my-auto px-2"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 mb-6 text-xs sm:text-sm text-blue-100 backdrop-blur-md shadow-xl"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>AI-Powered Global Itinerary Engine</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-amber-300 bg-amber-400/20">
              Free
            </span>
          </div>

          <h1
            className="font-extrabold text-white mb-4 leading-tight tracking-tight drop-shadow-md"
            style={{ fontSize: 'clamp(2.4rem, 6.5vw, 4.8rem)' }}
          >
            Plan Your Dream Journey in{' '}
            <span
              className="bg-gradient-to-r from-amber-300 via-orange-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm"
            >
              Seconds
            </span>
          </h1>

          <p
            className="text-blue-100 max-w-2xl mx-auto mb-8 leading-relaxed drop-shadow-sm text-sm sm:text-base md:text-lg"
          >
            Tell our AI where you want to go. Instant tailored day-by-day itineraries, recommended hotels,
            budget breakdown and direct Booking.com reservations.
          </p>

          {/* Interactive Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goToChat(tripInput || currentDest.suggestedPrompt);
            }}
            className="w-full max-w-2xl"
          >
            <div
              className="flex items-end gap-3 p-3 sm:p-4 rounded-3xl border border-white/25 shadow-2xl backdrop-blur-xl transition-all focus-within:border-amber-400/80 focus-within:ring-2 focus-within:ring-amber-400/30"
              style={{ background: 'rgba(15, 23, 42, 0.75)' }}
            >
              <textarea
                id="hero-trip-input"
                placeholder={`e.g. ${currentDest.suggestedPrompt}`}
                value={tripInput}
                onChange={(e) => setTripInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    goToChat(tripInput || currentDest.suggestedPrompt);
                  }
                }}
                rows={2}
                className="flex-1 bg-transparent text-white placeholder-blue-200/60 text-sm sm:text-base resize-none outline-none border-none px-2 py-1 leading-relaxed"
              />

              <button
                type="submit"
                id="hero-plan-trip-btn"
                className="flex-shrink-0 flex items-center gap-2 px-5 py-3.5 rounded-2xl font-extrabold text-sm text-slate-900 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/25 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current text-slate-900" />
                <span>Plan Trip</span>
              </button>
            </div>
          </form>

          {/* Direct 1-Click CTA to current destination */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs">
            <span className="text-white/60">Featured inspiration:</span>
            <button
              onClick={() => goToChat(currentDest.suggestedPrompt)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-amber-500/30 border border-white/20 hover:border-amber-400/50 text-amber-200 hover:text-white transition font-semibold"
            >
              <span>{currentDest.emoji}</span>
              <span>Generate trip to {currentDest.name}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ── Bottom Interactive Destination Carousel Bar ── */}
        <div className="relative z-10 max-w-5xl mx-auto w-full pt-4">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/15 rounded-2xl p-3 sm:p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Click a destination to change wallpaper & prompt:</span>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition text-xs flex items-center gap-1"
                  title={isPlaying ? "Pause rotation" : "Play rotation"}
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span className="text-[10px] hidden sm:inline">{isPlaying ? "Pause" : "Auto"}</span>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrev}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
                    title="Previous destination"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
                    title="Next destination"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Destination Buttons Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {destinations.map((dest, i) => {
                const isActive = i === currentIndex;
                return (
                  <button
                    key={dest.id}
                    onClick={() => handleSelectDestination(i)}
                    className={`group relative flex flex-col items-center p-2 rounded-xl border text-center transition-all duration-300 cursor-pointer overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-t from-amber-500/30 to-indigo-600/40 border-amber-400 ring-2 ring-amber-400/40 scale-105 shadow-lg'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span className="text-xl leading-none mb-1 group-hover:scale-110 transition-transform">
                      {dest.emoji}
                    </span>
                    <span className="text-xs font-bold text-white truncate w-full">
                      {dest.name}
                    </span>
                    <span className="text-[10px] text-white/50 truncate w-full">
                      {dest.country}
                    </span>

                    {isActive && (
                      <span className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Photographer Credit / Attribution Footer */}
            <div className="flex items-center justify-between text-[11px] text-white/50 pt-2 px-1 border-t border-white/10 mt-2">
              <span className="truncate max-w-xs sm:max-w-md">
                📍 {currentDest.tagline}
              </span>
              <a
                href={currentDest.photographerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-white/60 hover:text-amber-300 transition flex-shrink-0"
              >
                <Camera className="w-3 h-3" />
                <span>Photo: {currentDest.photographer}</span>
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="py-14 px-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 border-y border-white/10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 p-5 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md transition hover:bg-white/10"
            >
              <span className="font-extrabold text-white text-3xl sm:text-4xl">{s.value}</span>
              <span className="text-xs sm:text-sm text-blue-200 font-medium text-center">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTERACTIVE TRENDING DESTINATIONS SHOWCASE ── */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" /> Curated Travel Inspiration
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Trending Destinations This Season
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Explore high-resolution photography from Unsplash and generate complete AI itineraries with one tap.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest, i) => (
              <div
                key={dest.id}
                className="group bg-slate-800/90 rounded-3xl overflow-hidden border border-white/10 hover:border-amber-400/50 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1.5"
              >
                {/* Unsplash Image Card Header */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-white border border-white/20">
                    {dest.durationTag}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
                      <span>{dest.emoji}</span>
                      <span>{dest.country}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white drop-shadow-md">
                      {dest.name}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {dest.tagline}
                  </p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-amber-400 font-semibold">
                      {dest.budgetTag}
                    </span>
                    <button
                      onClick={() => goToChat(dest.suggestedPrompt)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 px-3.5 py-2 rounded-xl shadow-md transition transform group-hover:scale-105 cursor-pointer"
                    >
                      <span>Plan Trip</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="py-24 px-4 bg-slate-950 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Everything In One Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Smarter Travel Planning Powered by AI
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Replace hours of chaotic tab-switching with a single intelligent assistant.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="relative p-7 rounded-3xl bg-slate-900 border border-white/10 hover:border-indigo-500/50 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {f.badge && (
                  <span className={`inline-block mb-3 px-3 py-0.5 text-xs font-bold rounded-full text-white bg-gradient-to-r ${f.gradient}`}>
                    {f.badge}
                  </span>
                )}
                <div className={`flex items-center justify-center w-14 h-14 rounded-2xl text-white mb-5 shadow-lg bg-gradient-to-br ${f.gradient}`}>
                  <FeatureIcon iconKey={f.iconKey} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section id="how-it-works" className="py-24 px-4 bg-slate-900 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" /> Simple Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              From Idea to Itinerary in 4 Easy Steps
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              No complicated spreadsheets. Just your dream trip brought to life.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div
                  className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-xl mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg,#2563eb,#6366f1)',
                    boxShadow: '0 12px 32px rgba(99,102,241,0.35)',
                  }}
                >
                  <StepIcon index={i} />
                  <span
                    className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-slate-900"
                    style={{ background: '#fbbf24', boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}
                  >
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section id="testimonials" className="py-24 px-4 bg-slate-950 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-current" /> Loved by Travelers
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Real Trips. Real Stories.
            </h2>
            <p className="text-slate-400 max-w-md mx-auto text-sm sm:text-base">
              Thousands of adventurers explore with confidence using our AI.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="p-7 rounded-3xl bg-slate-900 border border-white/10 transition hover:border-amber-400/40 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/50"
                  />
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA SECTION ── */}
      <section className="relative py-28 px-4 overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 border-t border-white/10">
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Your Next Adventure <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">Starts Here</span>
          </h2>
          <p className="text-blue-100 text-base sm:text-lg max-w-xl mx-auto">
            Ready to discover extraordinary destinations? Generate your custom trip with hotels, itineraries, and maps right now.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link
              href="/create-new-trip"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-extrabold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-xl shadow-amber-500/25 transition transform hover:scale-105 active:scale-95"
            >
              <Zap className="w-5 h-5 fill-current" /> Plan My Trip Free
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-sm transition transform hover:scale-105 active:scale-95"
            >
              <Compass className="w-5 h-5" /> View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-4 bg-slate-950 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-orange-500 to-pink-500 text-white font-bold shadow-md">
              ✈
            </div>
            <span className="font-extrabold text-white text-lg">AI Trip Planner</span>
          </div>
          <div className="flex gap-6 flex-wrap text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/create-new-trip" className="hover:text-white transition">Plan Trip</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/contact-us" className="hover:text-white transition">Contact</Link>
          </div>
          <p className="text-slate-500 text-xs">
            © 2025 AI Trip Planner • High-resolution travel photos provided via Unsplash API
          </p>
        </div>
      </footer>
    </div>
  );
}