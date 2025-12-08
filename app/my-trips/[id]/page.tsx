"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { MapPin, Calendar, Hotel, Star, Sun, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { TripPlan } from "@/_components/ChatwithAi";

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
              className="w-full sm:w-auto text-lg px-6 py-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
              onClick={() => router.push("/my-trips")}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to My Trips
            </Button>
          </div>
        </div>
      </div>

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
              className="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden flex flex-col h-full"
            >
              <div className="relative h-56 sm:h-64 w-full">
                <Image
                  src="/hotel.jpg"
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

                <Button
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        hotel.hotel_address
                      )}`,
                      "_blank"
                    )
                  }
                >
                  Open in Maps
                </Button>
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