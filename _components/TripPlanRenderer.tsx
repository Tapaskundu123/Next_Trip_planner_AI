'use client';

import { useState } from "react";
import { Calendar, Hotel, MapPin, Star, Sun } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import axios from "axios";

interface TripPlan {
  destination: string;
  duration: string;
  origin: string;
  budget: string;
  group_size: string;
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

const TripPlanRenderer: React.FC<{ plan: TripPlan }> = ({ plan }) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveTrip = async () => {
    try {
      setSaving(true);

      const res = await axios.post("/api/saveTrip", plan);

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

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-10 text-center md:text-left">
          <h1 className="text-5xl font-bold flex items-center justify-center md:justify-start gap-4">
            <MapPin className="w-14 h-14" />
            Trip to {plan.destination}
          </h1>
          <p className="text-xl mt-4 opacity-95">
            {plan.origin} → {plan.destination} • {plan.duration} •{" "}
            {plan.group_size} • {plan.budget} Budget
          </p>
        </div>
      </div>

      {/* Hotels Section */}
      <section>
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
          <Hotel className="w-10 h-10 text-orange-500" />
          Recommended Hotels
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plan.hotels.map((hotel, i) => (
            <div key={i} className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition">
              <div className="relative h-64 bg-gray-200">
                <Image
                  src={
                    hotel.hotel_image_url ||
                    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"
                  }
                  alt={hotel.hotel_name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold">{hotel.hotel_name}</h3>
                <p className="text-gray-600 mt-2">{hotel.description}</p>

                <div className="flex justify-between items-center mt-6">
                  <span className="text-3xl font-bold text-green-600">
                    {hotel.price_per_night}/night
                  </span>

                  <div className="flex items-center gap-1">
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
                    <span className="ml-2 font-bold">{hotel.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-4">{hotel.hotel_address}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Itinerary */}
      <section>
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
          <Calendar className="w-10 h-10 text-purple-600" />
          Your Detailed Itinerary
        </h2>

        {plan.itinerary.map((day) => (
          <div key={day.day} className="bg-white rounded-3xl shadow-xl p-8 mb-10">
            <h3 className="text-3xl font-bold text-orange-600 mb-4">
              Day {day.day}{" "}
              <Sun className="inline w-8 h-8 text-yellow-500 ml-3" />
            </h3>

            <p className="text-xl italic text-gray-700 mb-8">
              {day.day_plan}
            </p>

            <div className="space-y-8">
              {day.activities.map((act, idx) => (
                <div key={idx} className="flex gap-6 bg-gray-50 rounded-2xl p-6">
                  <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                    <Image
                      src={
                        act.place_image_url ||
                        "https://images.unsplash.com/photo-1499853873796-d20d0e0dfaa9?w=600"
                      }
                      alt={act.place_name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-800">
                      {act.place_name}
                    </h4>

                    <p className="text-gray-700 mt-3 leading-relaxed">
                      {act.place_details}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                      <div>
                        <strong>Address:</strong> {act.place_address}
                      </div>
                      <div>
                        <strong>Tickets:</strong> {act.ticket_pricing}
                      </div>
                      <div>
                        <strong>Best Time:</strong> {act.best_time_to_visit}
                      </div>
                      <div>
                        <strong>Travel Time:</strong>{" "}
                        {act.time_travel_each_location}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="text-center py-12">
     { saved?
      <button disabled={saved} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-2xl font-bold px-16 py-6 rounded-full shadow-2xl hover:scale-105 transition transform disabled:opacity-50">Trip details Saved</button>
     :
      <button
          onClick={handleSaveTrip}
          disabled={saving}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-2xl font-bold px-16 py-6 rounded-full shadow-2xl hover:scale-105 transition transform disabled:opacity-50"
        >
          {saving ? "Saving..." : "Book This Trip Now!"}
        </button>
}
      </div>
    </div>
  );
};

export default TripPlanRenderer;
