"use client";

import { useEffect, useState, useRef } from "react";
import { Calendar, Hotel, MapPin, Star, Sun, Edit2, X, Check, Loader2, Download, Plane, ExternalLink, ShieldCheck } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import PackingList from "./PackingList";
import BudgetBreakdown from "./BudgetBreakdown";

// Dynamic import to avoid SSR issues with MapLibre
const ItineraryMap = dynamic(() => import("./ItineraryMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] bg-gray-900 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-300 text-sm">Loading interactive map…</p>
      </div>
    </div>
  ),
});

interface Activity {
  place_name: string;
  place_details: string;
  place_image_url: string;
  geo_coordinates: { latitude: number; longitude: number };
  place_address: string;
  ticket_pricing: string;
  time_travel_each_location: string;
  best_time_to_visit: string;
}

interface ItineraryDay {
  day: number;
  day_plan: string;
  best_time_to_visit_day: string;
  activities: Activity[];
}

interface Hotel {
  hotel_name: string;
  hotel_address: string;
  price_per_night: string;
  hotel_image_url: string;
  geo_coordinates: { latitude: number; longitude: number };
  rating: number;
  description: string;
}

interface TripPlan {
  destination: string;
  duration: string;
  startDate?: string;
  origin: string;
  budget: string;
  group_size: string;
  weather_note?: string;
  hotels: Hotel[];
  itinerary: ItineraryDay[];
}

// ─────────────────────────────────────────────
// Inline Edit Panel component
// ─────────────────────────────────────────────
function EditPanel({
  section,
  onSave,
  onCancel,
  isLoading,
}: {
  section: string;
  onSave: (request: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [text, setText] = useState("");
  return (
    <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-xl shadow-md">
      <p className="text-sm font-semibold text-orange-800 mb-2">✏️ What would you like to change?</p>
      <textarea
        className="w-full px-3 py-2 border border-orange-300 rounded-lg text-sm resize-none focus:outline-none focus:border-orange-500 bg-white"
        placeholder={`e.g. "Make hotels more budget-friendly" or "Add a museum visit"`}
        rows={2}
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={isLoading}
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onSave(text)}
          disabled={!text.trim() || isLoading}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {isLoading ? "Updating…" : "Apply"}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition"
        >
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main TripPlanRenderer
// ─────────────────────────────────────────────
const TripPlanRenderer: React.FC<{ plan: TripPlan; onNewChat?: () => void }> = ({ plan, onNewChat }) => {
  const router = useRouter();
  const [updatedPlan, setUpdatedPlan] = useState<TripPlan>(plan);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Edit state per section
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Load Unsplash images
  useEffect(() => {
    async function loadImages() {
      try {
        const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_KEY;
        if (!accessKey) return;

        const hotels = [...updatedPlan.hotels];
        const itinerary = updatedPlan.itinerary.map(d => ({
          ...d,
          activities: [...d.activities],
        }));

        const hotelRequests = hotels.map(h =>
          axios.get("https://api.unsplash.com/search/photos", {
            params: { query: h.hotel_name + " hotel" },
            headers: { Authorization: `Client-ID ${accessKey}` },
          }).catch(() => null)
        );

        const activityNames = itinerary.flatMap(d => d.activities.map(a => a.place_name));
        const activityRequests = activityNames.map(q =>
          axios.get("https://api.unsplash.com/search/photos", {
            params: { query: q },
            headers: { Authorization: `Client-ID ${accessKey}` },
          }).catch(() => null)
        );

        const [hotelResponses, activityResponses] = await Promise.all([
          Promise.all(hotelRequests),
          Promise.all(activityRequests),
        ]);

        hotelResponses.forEach((res, i) => {
          const url = res?.data?.results?.[0]?.urls?.regular;
          if (url) hotels[i].hotel_image_url = url;
        });

        let imgIdx = 0;
        itinerary.forEach(day => {
          day.activities.forEach(act => {
            const url = activityResponses[imgIdx]?.data?.results?.[0]?.urls?.regular;
            if (url) act.place_image_url = url;
            imgIdx++;
          });
        });

        setUpdatedPlan(prev => ({ ...prev, hotels, itinerary }));
      } catch (err) {
        console.error("Unsplash error:", err);
      }
    }
    loadImages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save trip
  const handleSaveTrip = async () => {
    try {
      setSaving(true);
      const res = await axios.post("/api/saveTrip", updatedPlan);
      if (res.data.success) {
        setSaved(true);
        toast.success("Trip saved successfully!");
        return;
      }
      toast.error(res.data.message || "Failed to save trip");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong!");
    } finally {
      setSaving(false);
    }
  };

  // PDF Export
  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      toast("Generating PDF…", { icon: "📄" });
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: updatedPlan }),
      });

      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trip-to-${updatedPlan.destination.replace(/\s+/g, "-")}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded!");
    } catch (err) {
      toast.error("Failed to generate PDF");
    } finally {
      setExportingPdf(false);
    }
  };

  // Section editing
  const handleEdit = async (section: string, editRequest: string) => {
    if (!editRequest.trim()) return;
    setEditLoading(true);
    try {
      const res = await fetch("/api/ai/edit-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: updatedPlan, editRequest, section }),
      });
      const data = await res.json();
      if (data.success) {
        if (section === "hotels" && data.updated.hotels) {
          setUpdatedPlan(prev => ({ ...prev, hotels: data.updated.hotels }));
          toast.success("Hotels updated!");
        } else if (section.startsWith("day_") && data.updated.day) {
          const dayNum = parseInt(section.replace("day_", ""));
          setUpdatedPlan(prev => ({
            ...prev,
            itinerary: prev.itinerary.map(d =>
              d.day === dayNum ? { ...d, ...data.updated } : d
            ),
          }));
          toast.success(`Day ${dayNum} updated!`);
        }
        setEditingSection(null);
      } else {
        toast.error("Edit failed. Please try again.");
      }
    } catch {
      toast.error("Failed to apply edit.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleMap = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank");
  };

  const p = updatedPlan;

  return (
    <div className="space-y-8 md:space-y-10 px-3 sm:px-5 lg:px-0">

      {/* ── Hero Header ── */}
      <div className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-700 text-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold flex items-center gap-3">
            <MapPin className="w-9 h-9 flex-shrink-0" />
            Trip to {p.destination}
          </h1>
          <p className="text-base sm:text-lg mt-3 opacity-90">
            {p.origin} → {p.destination} · {p.duration}
            {p.startDate && ` · Starting ${p.startDate}`}
            {" · "}{p.group_size} · {p.budget} Budget
          </p>
          {p.weather_note && (
            <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm flex items-center gap-2">
              🌤️ {p.weather_note}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold rounded-xl transition border border-white/30 disabled:opacity-50"
            >
              {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exportingPdf ? "Generating…" : "Download PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Budget Breakdown ── */}
      <section>
        <BudgetBreakdown
          destination={p.destination}
          duration={p.duration}
          budget={p.budget}
          group_size={p.group_size}
          hotels={p.hotels}
          itinerary={p.itinerary}
        />
      </section>

      {/* ── Interactive Activity Map ── */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-3">
          <MapPin className="w-8 h-8 text-red-500" />
          Interactive Map
        </h2>
        <ItineraryMap
          hotels={p.hotels}
          itinerary={p.itinerary}
          destination={p.destination}
        />
      </section>

      {/* ── Booking.com Travel Hub (Flights & Hotels) ── */}
      <section className="bg-gradient-to-br from-[#003580] via-[#002b66] to-[#001c44] text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-blue-400/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 px-3 py-1 rounded-full text-xs font-bold text-yellow-300 mb-2.5">
              <span className="font-black text-sm">Booking.com</span> Partner Integration
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5">
              <Plane className="w-7 h-7 text-yellow-400" /> Book Flights & Stays for Your Trip
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Complete your journey from {p.origin} to {p.destination} with guaranteed best rates.
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap text-xs text-blue-200">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <ShieldCheck className="w-4 h-4 text-green-400" /> Best Price Guarantee
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <ShieldCheck className="w-4 h-4 text-green-400" /> Free Cancellation Options
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {/* Flight Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/15 flex flex-col justify-between hover:bg-white/15 transition shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
                  <Plane className="w-4 h-4 text-yellow-400" /> Flight Search
                </span>
                <span className="text-xs bg-yellow-400/20 text-yellow-300 font-semibold px-2.5 py-1 rounded-full">
                  {p.group_size} Travelers
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                {p.origin} ✈ {p.destination}
              </h3>
              <p className="text-xs text-blue-200 mb-4">
                Travel Date: <strong className="text-white">{p.startDate || "Flexible departure"}</strong> · Duration: {p.duration}
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <a
                href={`https://www.booking.com/flights/index.html?from=${encodeURIComponent(p.origin)}&to=${encodeURIComponent(p.destination)}&departDate=${p.startDate || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-[#003580] font-extrabold text-sm rounded-xl shadow-md transition transform hover:scale-[1.02]"
              >
                Search Flights on Booking.com ↗
              </a>
              <a
                href={`https://www.google.com/travel/flights?q=flights%20from%20${encodeURIComponent(p.origin)}%20to%20${encodeURIComponent(p.destination)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition"
              >
                Compare on Google Flights <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>

          {/* Hotels Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/15 flex flex-col justify-between hover:bg-white/15 transition shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
                  <Hotel className="w-4 h-4 text-yellow-400" /> Stays & Accommodations
                </span>
                <span className="text-xs bg-emerald-400/20 text-emerald-300 font-semibold px-2.5 py-1 rounded-full">
                  {p.budget} Budget
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                Hotels & Resorts in {p.destination}
              </h3>
              <p className="text-xs text-blue-200 mb-4">
                Explore curated stays matching your {p.budget} budget in {p.destination} with instant confirmation.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <a
                href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(p.destination)}&checkin=${p.startDate || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-100 text-[#003580] font-extrabold text-sm rounded-xl shadow-md transition transform hover:scale-[1.02]"
              >
                Search All Hotels on Booking.com ↗
              </a>
              <p className="text-center text-[11px] text-blue-200/90 pt-1">
                ⭐ Or click &quot;Book on Booking.com&quot; directly on any recommended hotel below
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hotels ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Hotel className="w-8 h-8 text-orange-500" />
            Recommended Hotels
          </h2>
          <button
            onClick={() => setEditingSection(editingSection === "hotels" ? null : "hotels")}
            className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 border border-orange-200 hover:border-orange-300 px-3 py-1.5 rounded-lg transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Hotels
          </button>
        </div>

        {editingSection === "hotels" && (
          <EditPanel
            section="hotels"
            onSave={req => handleEdit("hotels", req)}
            onCancel={() => setEditingSection(null)}
            isLoading={editLoading}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {p.hotels.map((hotel, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col hover:shadow-2xl transition-shadow">
              <div className="relative h-48 bg-gray-200 w-full">
                {hotel.hotel_image_url ? (
                  <Image
                    src={hotel.hotel_image_url}
                    alt={hotel.hotel_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-200">
                    <Hotel className="w-16 h-16 text-orange-400" />
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-1">{hotel.hotel_name}</h3>
                <p className="text-gray-500 text-sm mb-3 flex-1">{hotel.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-green-600">{hotel.price_per_night}<span className="text-sm font-normal text-gray-400">/night</span></span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className={`w-4 h-4 ${s < Math.floor(hotel.rating) ? "text-yellow-400 fill-current" : "text-gray-200"}`} />
                    ))}
                    <span className="ml-1 text-sm font-bold">{hotel.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-3">{hotel.hotel_address}</p>
                <div className="grid grid-cols-2 gap-2 mt-auto pt-1">
                  <Button onClick={() => handleMap(hotel.hotel_address)} size="sm" variant="outline" className="w-full text-xs">
                    View on Maps →
                  </Button>
                  <a
                    href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.hotel_name + " " + p.destination)}&checkin=${p.startDate || ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg text-white bg-[#003580] hover:bg-[#00224f] shadow-sm transition-all hover:scale-[1.02]"
                  >
                    <span className="font-black text-yellow-300">B.</span> Book on Booking ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Itinerary ── */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-5 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-purple-600" />
          Your Detailed Itinerary
        </h2>

        {p.itinerary.map(day => (
          <div key={day.day} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-7 mb-6">
            {/* Day Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-2xl font-extrabold text-orange-600 flex items-center gap-2">
                Day {day.day} <Sun className="w-6 h-6 text-yellow-500" />
              </h3>
              <button
                onClick={() => setEditingSection(editingSection === `day_${day.day}` ? null : `day_${day.day}`)}
                className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 border border-purple-200 hover:border-purple-300 px-2.5 py-1.5 rounded-lg transition"
              >
                <Edit2 className="w-3 h-3" />
                Edit Day
              </button>
            </div>
            <p className="text-base italic text-gray-600 mb-5">{day.day_plan}</p>

            {editingSection === `day_${day.day}` && (
              <EditPanel
                section={`day_${day.day}`}
                onSave={req => handleEdit(`day_${day.day}`, req)}
                onCancel={() => setEditingSection(null)}
                isLoading={editLoading}
              />
            )}

            <div className="space-y-5">
              {day.activities.map((act, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                  {act.place_image_url && (
                    <div className="relative w-full h-44">
                      <Image
                        src={act.place_image_url}
                        alt={act.place_name}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        unoptimized
                      />
                      <div className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        Stop {idx + 1}
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="text-lg font-bold mb-1">{act.place_name}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">{act.place_details}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { label: "📍 Address", value: act.place_address },
                        { label: "🎫 Tickets", value: act.ticket_pricing },
                        { label: "⏰ Best Time", value: act.best_time_to_visit },
                        { label: "🚗 Travel Time", value: act.time_travel_each_location },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-white rounded-lg px-3 py-2 border border-gray-100">
                          <span className="font-semibold text-gray-500">{label}</span>
                          <p className="text-gray-700 mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleMap(act.place_address)}
                      className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" /> Open in Maps
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Packing List ── */}
      <section>
        <PackingList
          destination={p.destination}
          duration={p.duration}
          budget={p.budget}
          group_size={p.group_size}
          itinerary={p.itinerary}
        />
      </section>

      {/* ── Save / Done ── */}
      <div className="text-center py-10 sm:py-14">
        {!saved ? (
          <div className="space-y-3">
            <button
              onClick={handleSaveTrip}
              disabled={saving}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xl font-bold px-10 sm:px-20 py-5 rounded-full shadow-2xl hover:scale-105 transition disabled:opacity-50 w-full sm:w-auto"
            >
              {saving ? "Saving…" : "💾 Save & Book This Trip"}
            </button>
            <p className="text-gray-400 text-sm">Trip will be saved to your account</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-5xl">🎉</div>
            <h2 className="text-3xl sm:text-4xl font-bold">Trip Saved Successfully!</h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/my-trips")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-base font-semibold transition"
              >
                View My Trips
              </button>
              <button
                onClick={() => onNewChat ? onNewChat() : router.refresh()}
                className="bg-white border-2 border-purple-600 text-purple-700 hover:bg-purple-50 px-8 py-3 rounded-full text-base font-semibold transition"
              >
                Plan Another Trip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripPlanRenderer;