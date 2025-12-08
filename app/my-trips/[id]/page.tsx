"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { MapPin, Calendar, Hotel, Star, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

import { TripPlan } from "@/_components/ChatwithAi";//interface import

const SavedTripPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
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
  }, []);

  if (loading)
    return <p className="text-center text-xl py-20">Loading trip...</p>;

  if (!trip)
    return <p className="text-center text-xl py-20">Trip not found</p>;

  const t = trip;

  return (
    <div className="px-4 md:px-16 py-12 space-y-12">

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-10 text-center md:text-left">
          <h1 className="text-5xl font-bold flex items-center justify-center md:justify-start gap-4">
            <MapPin className="w-14 h-14" />
            Trip to {t.destination}
          </h1>
          <p className="text-xl mt-4 opacity-95">
            {t.origin} → {t.destination} • {t.duration} • {t.group_size} People • {t.budget} Budget
          </p>
        </div>
      </div>

      {/* HOTELS SECTION */}
      <section>
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
          <Hotel className="w-10 h-10 text-orange-500" />
          Your Hotels
        </h2>

        <div className="grid md:grid-cols-2 gap-10">
          {t.hotels.map((hotel, i) => (
            <div key={i} className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="relative h-64 w-full">
                <Image
                  src={hotel.hotel_image_url}
                  alt="Hotel"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-bold">{hotel.hotel_name}</h3>

                <p className="text-gray-600">{hotel.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    {hotel.price_per_night}/night
                  </span>

                  <div className="flex gap-1">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        className={`w-6 h-6 ${
                          s < Math.floor(hotel.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-gray-500">{hotel.hotel_address}</p>

                <Button
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
      <section>
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
          <Calendar className="w-10 h-10 text-purple-600" />
          Itinerary
        </h2>

        {t.itinerary.map((day, idx) => (
          <div key={idx} className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
            <h3 className="text-3xl font-bold text-orange-600 flex items-center gap-3">
              Day {day.day} <Sun className="w-8 h-8 text-yellow-500" />
            </h3>

            <p className="text-xl italic text-gray-700">{day.day_plan}</p>

            {day.activities.map((act, i) => (
              <div         
                key={i}
                className="flex flex-col md:flex-row gap-6 bg-gray-50 rounded-2xl p-6"
              >
                <div className="relative w-full md:w-48 h-48 rounded-2xl overflow-hidden">
                  <Image
                    src={act.place_image_url}
                    alt={act.place_name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <h4 className="text-2xl font-bold">{act.place_name}</h4>
                  <p className="text-gray-700">{act.place_details}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><strong>Address:</strong> {act.place_address}</p>
                    <p><strong>Tickets:</strong> {act.ticket_pricing}</p>
                    <p><strong>Best Time:</strong> {act.best_time_to_visit}</p>
                    <p><strong>Travel Time:</strong> {act.time_travel_each_location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>

      {/* BACK TO MY TRIPS */}
      <div className="text-center">
        <Button
          className="text-xl px-10 py-5 rounded-full bg-blue-600 text-white"
          onClick={() => router.push("/my-trips")}
        >
          Back to My Trips
        </Button>
      </div>
    </div>
  );
};

export default SavedTripPage;
