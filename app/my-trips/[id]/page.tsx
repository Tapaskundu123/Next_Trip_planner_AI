"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { MapPin, Calendar, Hotel, Star, Sun, ArrowLeft, Plane, ShieldCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { TripPlan } from "@/_components/TripWizard";

const SavedTripPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);
      const res = await axios.get(`/api/getTrip/${id}`);

      if (!res.data.success) {
        toast.error("Trip not found");
        return;
      }

      setTrip(res.data.data);
    } catch (err) {
      toast.error("Failed to load trip");
    } finally {
      setLoading(false);
    }
  }

  fetchData();
}, [id]); // ← This is correct and eliminates the warning

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl font-medium">Loading trip...</p>
      </div>
    );

  if (!trip)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl font-medium text-red-600">Trip not found</p>
      </div>
    );

  const t = trip;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-12 xl:px-20 space-y-10 md:space-y-16">
      {/* HEADER BANNER */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold flex items-center justify-center sm:justify-start gap-3">
                <MapPin className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14" />
                Trip to {t.destination}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl mt-3 opacity-95 leading-relaxed">
                {t.origin} → {t.destination}
                <br className="sm:hidden" /> • {t.duration} • {t.group_size} People • {t.budget} Budget
              </p>
            </div>

            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto text-base px-6 py-5 bg-white/20 hover:bg-white/30 text-white rounded-xl border border-white/30 backdrop-blur-sm"
              onClick={() => router.push("/my-trips")}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* ── Booking.com Travel Hub (Flights & Hotels) ── */}
      <section className="bg-gradient-to-br from-[#003580] via-[#002b66] to-[#001c44] text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-blue-400/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 px-3 py-1 rounded-full text-xs font-bold text-yellow-300 mb-2.5">
              <span className="font-black text-sm">Booking.com</span> Integration
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5">
              <Plane className="w-7 h-7 text-yellow-400" /> Book Flights & Stays for Your Trip
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Ready to travel? Book your flights and accommodations in {t.destination} at guaranteed best rates.
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap text-xs text-blue-200">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <ShieldCheck className="w-4 h-4 text-green-400" /> Best Price Guarantee
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <ShieldCheck className="w-4 h-4 text-green-400" /> Verified Reviews
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {/* Flight Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/15 flex flex-col justify-between hover:bg-white/15 transition shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
                  <Plane className="w-4 h-4 text-yellow-400" /> Flights
                </span>
                <span className="text-xs bg-yellow-400/20 text-yellow-300 font-semibold px-2.5 py-1 rounded-full">
                  {t.group_size} Travelers
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                {t.origin} ✈ {t.destination}
              </h3>
              <p className="text-xs text-blue-200 mb-4">
                Estimated Duration: <strong className="text-white">{t.duration}</strong> · Budget: {t.budget}
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <a
                href={`https://www.booking.com/flights/index.html?from=${encodeURIComponent(t.origin)}&to=${encodeURIComponent(t.destination)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-[#003580] font-extrabold text-sm rounded-xl shadow-md transition transform hover:scale-[1.02]"
              >
                Search Flights on Booking.com ↗
              </a>
              <a
                href={`https://www.google.com/travel/flights?q=flights%20from%20${encodeURIComponent(t.origin)}%20to%20${encodeURIComponent(t.destination)}`}
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
                  <Hotel className="w-4 h-4 text-yellow-400" /> Accommodations
                </span>
                <span className="text-xs bg-emerald-400/20 text-emerald-300 font-semibold px-2.5 py-1 rounded-full">
                  {t.budget} Budget
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                Stays & Resorts in {t.destination}
              </h3>
              <p className="text-xs text-blue-200 mb-4">
                Explore 500+ verified properties matching your budget in {t.destination} with free cancellation.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <a
                href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(t.destination)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-100 text-[#003580] font-extrabold text-sm rounded-xl shadow-md transition transform hover:scale-[1.02]"
              >
                Search All Hotels on Booking.com ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* HOTELS SECTION */}
      <section className="space-y-8">
        <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <Hotel className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
          Recommended Hotels
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {t.hotels.map((hotel, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow"
            >
              <div className="relative h-56 sm:h-64 w-full">
                <Image
                  src={hotel.hotel_image_url || "/hotel.jpg"}
                  alt={hotel.hotel_name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-5 sm:p-7 space-y-4 flex-1 flex flex-col">
                <h3 className="text-xl sm:text-2xl font-bold line-clamp-2">
                  {hotel.hotel_name}
                </h3>

                <p className="text-gray-600 text-sm sm:text-base line-clamp-3">
                  {hotel.description}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xl sm:text-2xl font-bold text-green-600">
                    {hotel.price_per_night}/night
                  </span>

                  <div className="flex gap-1">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          s < Math.floor(hotel.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-gray-500 text-sm line-clamp-2">
                  {hotel.hotel_address}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          hotel.hotel_address
                        )}`,
                        "_blank"
                      )
                    }
                  >
                    View on Maps
                  </Button>
                  <a
                    href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.hotel_name + " " + t.destination)}`}
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

      {/* ITINERARY */}
      <section className="space-y-10">
        <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
          Your Itinerary
        </h2>

        <div className="space-y-10">
          {t.itinerary.map((day, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 space-y-6"
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-orange-600 flex items-center gap-3">
                Day {day.day}
                <Sun className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500" />
              </h3>

              <p className="text-lg sm:text-xl italic text-gray-700 leading-relaxed">
                {day.day_plan}
              </p>

              <div className="space-y-6">
                {day.activities.map((act, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row gap-5"
                  >
                    <div className="relative w-full md:w-52 h-48 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src="/trip.jpg"
                        alt={act.place_name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-4">
                      <h4 className="text-xl sm:text-2xl font-bold">
                        {act.place_name}
                      </h4>
                      <p className="text-gray-700 text-sm sm:text-base">
                        {act.place_details}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <p>
                          <strong>Address:</strong> {act.place_address}
                        </p>
                        <p>
                          <strong>Tickets:</strong> {act.ticket_pricing}
                        </p>
                        <p>
                          <strong>Best Time:</strong> {act.best_time_to_visit}
                        </p>
                        <p>
                          <strong>Travel Time:</strong> {act.time_travel_each_location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <div className="text-center pt-8">
        <Button
          size="lg"
          className="w-full sm:w-auto text-lg px-10 py-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          onClick={() => router.push("/my-trips")}
        >
          <ArrowLeft className="w-6 h-6 mr-3" />
          Back to My Trips
        </Button>
      </div>
    </div>
  );
};

export default SavedTripPage;