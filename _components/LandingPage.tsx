'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plane, MapPin, Sparkles, Star,
  Clock, Wallet, Brain, Map, FileText, Mic,
  CheckCircle, ChevronRight, ArrowRight, Zap, Shield,
  MessageSquare, Package, TrendingUp,
} from 'lucide-react';

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
  { value: '4.9 stars', label: 'Average Rating' },
  { value: '<10s', label: 'Plan Generated' },
];

const testimonials = [
  { name: 'Priya Sharma', location: 'Mumbai, India', avatar: 'https://i.pravatar.cc/80?img=47', rating: 5, text: 'Planned my entire Europe trip in under 5 minutes! The AI suggested places I had never discovered myself.' },
  { name: 'James Kowalski', location: 'Chicago, USA', avatar: 'https://i.pravatar.cc/80?img=12', rating: 5, text: 'The budget breakdown was spot-on. We stayed within budget and still had the trip of a lifetime in Southeast Asia.' },
  { name: 'Yuki Tanaka', location: 'Tokyo, Japan', avatar: 'https://i.pravatar.cc/80?img=26', rating: 5, text: 'The interactive map and day-by-day itinerary made navigating a new country so effortless.' },
];

const suggestions = ['Plan a week in Bali', 'Inspire me where to go', 'Discover hidden gems', 'Budget trip to Japan'];

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

  useEffect(() => { const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t); }, []);

  const goToChat = (message: string) => {
    if (!message.trim()) return;
    router.push('/create-new-trip?message=' + encodeURIComponent(message));
  };

  return (
    <div className="overflow-x-hidden">

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#0f172a 0%,#0c1a3a 50%,#1e1b4b 100%)' }} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle,rgba(59,130,246,0.2),transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.2),transparent 70%)', animationDelay: '1.5s' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div
          className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.8s ease,transform 0.8s ease' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 mb-8 text-sm text-blue-200 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <Sparkles className="w-4 h-4 text-amber-400" />
            Powered by Gemini AI &middot; Plan any trip in seconds
            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-amber-300" style={{ background: 'rgba(251,191,36,0.15)' }}>Free</span>
          </div>

          <h1 className="font-extrabold text-white mb-6 leading-tight" style={{ fontSize: 'clamp(2.2rem,7vw,5rem)' }}>
            Your AI Travel{' '}
            <span className="block" style={{ background: 'linear-gradient(90deg,#fbbf24,#fb923c,#fde047)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Planner - Built
            </span>
            for Explorers
          </h1>

          <p className="text-blue-200 max-w-2xl mx-auto mb-10 leading-relaxed" style={{ fontSize: 'clamp(1rem,2vw,1.2rem)' }}>
            Describe your dream trip and get a personalised itinerary, hotel picks, budget breakdown and interactive map in under 10 seconds.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); goToChat(tripInput); }} className="w-full max-w-2xl">
            <div className="flex items-end gap-3 p-3 rounded-2xl border border-white/20 shadow-2xl" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
              <textarea
                id="hero-trip-input"
                placeholder="e.g. 7-day trip to Japan in April with a budget of Rs 1.5L..."
                value={tripInput}
                onChange={(e) => setTripInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); goToChat(tripInput); } }}
                rows={2}
                className="flex-1 bg-transparent text-white placeholder-blue-300/70 text-sm resize-none outline-none border-none px-2 py-1 leading-relaxed"
              />
              <button
                type="submit"
                id="hero-plan-trip-btn"
                className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white border-none cursor-pointer transition-transform hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}
              >
                <Zap className="w-4 h-4" /> Plan Trip
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-2.5 mt-5">
            {suggestions.map((s, i) => (
              <button key={i} id={'suggestion-' + i} onClick={() => goToChat(s)}
                className="px-4 py-2 rounded-full text-blue-200 text-sm cursor-pointer border border-white/15 transition-all hover:text-white"
                style={{ background: 'rgba(255,255,255,0.07)' }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#93c5fd'; }}
              >{s}</button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-xs text-white/30 animate-bounce">
          <span>Scroll to explore</span>
          <ChevronRight className="w-4 h-4 rotate-90" />
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-4" style={{ background: 'linear-gradient(90deg,#1d4ed8,#4f46e5)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-6 rounded-2xl border border-white/20 transition-all hover:bg-white/20" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
              <span className="font-extrabold text-white" style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)' }}>{s.value}</span>
              <span className="text-sm text-blue-200 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" /> Powerful Features
            </span>
            <h2 className="font-extrabold text-gray-900 mb-4" style={{ fontSize: 'clamp(1.8rem,5vw,3.2rem)' }}>
              Everything You Need to{' '}
              <span style={{ background: 'linear-gradient(90deg,#2563eb,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Travel Smarter</span>
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto" style={{ fontSize: 17, lineHeight: 1.6 }}>
              One intelligent assistant replaces hours of manual research.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="relative p-7 rounded-2xl bg-white border border-gray-100 overflow-hidden cursor-default transition-all duration-300"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
              >
                {f.badge && <span className={'inline-block mb-3 px-3 py-0.5 text-xs font-bold rounded-full text-white bg-gradient-to-r ' + f.gradient}>{f.badge}</span>}
                <div className={'flex items-center justify-center w-14 h-14 rounded-2xl text-white mb-5 shadow-lg bg-gradient-to-br ' + f.gradient}>
                  <FeatureIcon iconKey={f.iconKey} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-bold mb-4">
              <TrendingUp className="w-4 h-4" /> Simple Process
            </span>
            <h2 className="font-extrabold text-gray-900 mb-4" style={{ fontSize: 'clamp(1.8rem,5vw,3.2rem)' }}>
              From Idea to Itinerary in{' '}
              <span style={{ background: 'linear-gradient(90deg,#f59e0b,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>4 Easy Steps</span>
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto" style={{ fontSize: 17, lineHeight: 1.6 }}>No sign-up walls. No complicated forms. Just describe your trip.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-xl mb-6 transition-transform duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1)', boxShadow: '0 12px 32px rgba(99,102,241,0.35)' }}>
                  <StepIcon index={i} />
                  <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: '#fbbf24', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>{i + 1}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 px-4" style={{ background: 'linear-gradient(135deg,#0f172a 0%,#0c1a3a 50%,#1e1b4b 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-blue-200 text-sm font-bold mb-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Loved by Travellers
            </span>
            <h2 className="font-extrabold text-white mb-4" style={{ fontSize: 'clamp(1.8rem,5vw,3.2rem)' }}>
              Real Trips.{' '}
              <span style={{ background: 'linear-gradient(90deg,#fbbf24,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Real Stories.</span>
            </h2>
            <p className="text-blue-200 max-w-md mx-auto" style={{ fontSize: 17 }}>Thousands of travellers trust our AI planner for their adventures.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-7 rounded-2xl bg-white border border-gray-100 transition-all duration-300 cursor-default"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
              >
                <div className="flex gap-1 mb-4">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-100" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold mb-6">
              <Shield className="w-4 h-4" /> Why Choose Us
            </span>
            <h2 className="font-extrabold text-gray-900 mb-5 leading-tight" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)' }}>
              Travel Planning{' '}
              <span style={{ background: 'linear-gradient(90deg,#10b981,#14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Reimagined</span>
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed" style={{ fontSize: 17 }}>
              Traditional planning takes hours of tab-switching and guesswork. Our AI cuts that to a single conversation.
            </p>
            <ul className="space-y-4">
              {[
                { text: 'Full itinerary in under 10 seconds', color: '#3b82f6' },
                { text: 'Learns your preferences and adapts', color: '#8b5cf6' },
                { text: 'Budget-aware recommendations', color: '#10b981' },
                { text: 'Safe travel tips and weather alerts', color: '#f59e0b' },
                { text: 'Best-season and date-aware planning', color: '#f43f5e' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: item.color }} />
                  <span className="text-gray-700 font-medium">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(135deg,#eff6ff,#eef2ff)' }} />
            <div className="relative p-8 space-y-4">
              <div className="flex justify-end">
                <div className="max-w-xs px-4 py-3 rounded-2xl rounded-tr-sm text-white text-sm leading-relaxed" style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                  Plan a 5-day trip to Kyoto. Budget Rs 80,000. I love temples and street food.
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-sm px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-gray-100 text-sm text-gray-800 leading-relaxed" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <strong>Perfect!</strong> Here is your 5-day Kyoto itinerary:<br />
                  Day 1: Fushimi Inari + Nishiki Market<br />
                  Day 2: Arashiyama Bamboo Grove<br />
                  Day 3: Street food tour in Gion...
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-xs px-4 py-3 rounded-2xl rounded-tr-sm text-white text-sm" style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                  Can you adjust Day 2 for a rainy day?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-sm px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-gray-100 text-sm text-gray-800 leading-relaxed" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <strong>Rainy Day Plan:</strong> Nishiki Market (covered), Kyoto Railway Museum, Pontocho dining alley...
                </div>
              </div>
              <div className="flex justify-between flex-wrap gap-2 p-4 rounded-2xl bg-white border border-gray-100 text-xs text-gray-500" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500" /> Generated in <b className="text-gray-800 ml-0.5">3.2s</b></span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-500" /> <b className="text-gray-800">14</b> places</span>
                <span className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-emerald-500" /> <b className="text-gray-800">Rs 78,400</b></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28 px-4 overflow-hidden" style={{ background: 'linear-gradient(135deg,#1d4ed8,#4338ca,#7c3aed)' }}>
        <div className="absolute top-0 left-1/3 w-72 h-72 rounded-full blur-3xl" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(139,92,246,0.2)' }} />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-extrabold text-white mb-5 leading-tight" style={{ fontSize: 'clamp(2rem,6vw,4rem)' }}>
            Your Next Adventure <span className="text-amber-400">Starts Here</span>
          </h2>
          <p className="text-blue-200 mb-10" style={{ fontSize: 19, lineHeight: 1.6 }}>
            Join thousands of smart travellers using AI to plan unforgettable trips.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/create-new-trip" id="cta-plan-trip"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl font-extrabold text-gray-900 no-underline transition-transform hover:scale-105 active:scale-95"
              style={{ background: '#fbbf24', fontSize: 17, boxShadow: '0 20px 40px rgba(251,191,36,0.35)' }}>
              <Zap className="w-5 h-5" /> Plan My Trip Free
            </Link>
            <Link href="/login" id="cta-sign-in"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl font-bold text-white no-underline border border-white/25 transition-all hover:scale-105 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.1)', fontSize: 17 }}>
              Sign In <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="mt-6 text-sm text-blue-300 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> No credit card required - Free to get started
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-4" style={{ background: '#020617' }}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
              <Plane className="w-5 h-5 text-white" style={{ transform: 'rotate(45deg)' }} />
            </div>
            <span className="font-extrabold text-white text-lg">AI Trip Planner</span>
          </div>
          <div className="flex gap-7 flex-wrap">
            {[{ label: 'Home', href: '/' }, { label: 'Pricing', href: '/pricing' }, { label: 'Contact', href: '/contact-us' }, { label: 'Login', href: '/login' }].map((link) => (
              <Link key={link.label} href={link.href} className="text-gray-500 text-sm no-underline transition-colors hover:text-white">{link.label}</Link>
            ))}
          </div>
          <p className="text-gray-600 text-sm">2025 AI Trip Planner - Made with love for explorers</p>
        </div>
      </footer>
    </div>
  );
}