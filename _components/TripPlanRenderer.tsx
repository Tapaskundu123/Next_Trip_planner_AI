"use client";

import { useEffect, useState } from "react";
import { Calendar, Hotel, MapPin, Star, Sun } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import RouteMap from "./RouteMap";

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

const TripPlanRenderer: React.FC<{ plan: TripPlan; onNewChat?: () => void }> = ({ plan, onNewChat }) => {
  const router = useRouter();

  // ⭐ LOCAL STATE — will store updated images
  const [updatedPlan, setUpdatedPlan] = useState<TripPlan>(plan);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ⭐ Load images from Unsplash
  useEffect(() => {
    async function loadImages() {
      try {
        const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_KEY;
        if (!accessKey) {
          console.error("Unsplash key missing");
          return;
        }

        const hotels = [...updatedPlan.hotels];
        const itinerary = [...updatedPlan.itinerary];

        // ========================
        // HOTEL IMAGES
        // ========================
        const hotelNames = hotels.map((h) => h.hotel_name);

        const hotelRequests = hotelNames.map((query) =>
          axios.get("https://api.unsplash.com/search/photos", {
            params: { query },
            headers: { Authorization: `Client-ID ${accessKey}` },
          })
        );

        const hotelResponses = await Promise.all(hotelRequests);

        hotelResponses.forEach((res, index) => {
          const url = res.data.results?.[0]?.urls?.regular;
          if (url && !hotels[index].hotel_image_url) {
            hotels[index].hotel_image_url = url;
          }
        });

        // ========================
        // ACTIVITY IMAGES
        // ========================
        const activityNames = itinerary.flatMap((d) =>
          d.activities.map((a) => a.place_name)
        );

        const activityRequests = activityNames.map((query) =>
          axios.get("https://api.unsplash.com/search/photos", {
            params: { query },
            headers: { Authorization: `Client-ID ${accessKey}` },
          })
        );

        const activityResponses = await Promise.all(activityRequests);

        let imgIndex = 0;
        itinerary.forEach((day) => {
          day.activities.forEach((act) => {
            const url = activityResponses[imgIndex]?.data?.results?.[0]?.urls?.regular;
            if (url && !act.place_image_url) {
              act.place_image_url = url;
            }
            imgIndex++;
          });
        });

        // ⭐ Update local state with new images
        setUpdatedPlan({
          ...updatedPlan,
          hotels,
          itinerary,
        });

      } catch (err) {
        console.error("Unsplash error:", err);
      }
    }

    loadImages();
  }, [updatedPlan]);

  // ==========================
  // SAVE TRIP
  // ==========================
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

  const handleMap = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    window.open(url, "_blank");
  };

  const p = updatedPlan; // cleaner usage

  return (
    <div className="space-y-8 md:space-y-12 px-4 sm:px-6 lg:px-0">
      {/* Header - Responsive centering */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8 md:p-10 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold flex items-center justify-center md:justify-start gap-3 md:gap-4">
            <MapPin className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex-shrink-0" />
            Trip to {p.destination}
          </h1>
          <p className="text-lg sm:text-xl mt-3 md:mt-4 opacity-95 text-center md:text-left">
            {p.origin} → {p.destination} • {p.duration} •{" "}
            {p.group_size} • {p.budget} Budget
          </p>
        </div>
      </div>

      {/* Route Map - Shows trip route from origin to destination */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
          <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
          Your Trip Route
        </h2>
        <RouteMap origin={p.origin} destination={p.destination} />
      </section>

      {/* Hotels - Grid for better mobile/desktop layout */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
          <Hotel className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
          Recommended Hotels
        </h2>

        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {p.hotels.map((hotel, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col"
            >
              {/* Image - Full width, fixed aspect */}
              <div className="relative h-48 sm:h-56 md:h-64 bg-gray-200 w-full">
                <Image
                  src="/hotel.jpg"
                  alt={hotel.hotel_name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              <div className="p-4 sm:p-6 flex flex-col flex-1">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{hotel.hotel_name}</h3>
                <p className="text-gray-600 mb-4 flex-1">{hotel.description}</p>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl sm:text-3xl font-bold text-green-600">
                    {hotel.price_per_night}/night
                  </span>

                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${s < Math.floor(hotel.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                          }`}
                      />
                    ))}
                    <span className="ml-2 font-bold text-sm sm:text-base">{hotel.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-4">{hotel.hotel_address}</p>
                <Button
                  onClick={() => handleMap(hotel.hotel_address)}
                  className="w-full sm:w-auto"
                  size="sm"
                >
                  View on Map
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Itinerary - Full-width days, responsive activities */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
          <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
          Your Detailed Itinerary
        </h2>

        {p.itinerary.map((day) => (
          <div key={day.day} className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 mb-6 sm:mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-orange-600 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
              Day {day.day}
              <Sun className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            </h3>

            <p className="text-lg sm:text-xl italic text-gray-700 mb-6 sm:mb-8">{day.day_plan}</p>

            <div className="space-y-6">
              {day.activities.map((act, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-2 flex flex-col gap-4 md:gap-6">
                  {/* Image - Stack on mobile, side-by-side on desktop */}
                  <div className="relative w-full h-48 md:h-60 rounded-xl sm:rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                    <Image
                      src="/trip.jpg"
                      alt={act.place_name || "Place image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 160px"
                    />
                  </div>

                  <div className="flex-1 space-y-3">
                    <h4 className="text-xl sm:text-2xl font-bold">{act.place_name}</h4>

                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{act.place_details}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                      <div className="space-y-1">
                        <strong>Address:</strong>
                        <p className="text-gray-600">{act.place_address}</p>
                      </div>
                      <div className="space-y-1">
                        <strong>Tickets:</strong>
                        <p className="text-gray-600">{act.ticket_pricing}</p>
                      </div>
                      <div className="space-y-1">
                        <strong>Best Time:</strong>
                        <p className="text-gray-600">{act.best_time_to_visit}</p>
                      </div>
                      <div className="space-y-1">
                        <strong>Travel Time:</strong>
                        <p className="text-gray-600">{act.time_travel_each_location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* SAVE TRIP - Responsive buttons */}
      <div className="text-center py-12 sm:py-16">
        {!saved ? (
          <button
            onClick={handleSaveTrip}
            disabled={saving}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl sm:text-2xl font-bold px-8 sm:px-20 py-4 sm:py-6 rounded-full shadow-2xl hover:scale-105 transition disabled:opacity-50 w-full sm:w-auto"
          >
            {saving ? "Saving..." : "Save & Book This Trip"}
          </button>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-4xl font-bold">Trip Saved Successfully!</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/my-trips")}
                className="bg-blue-600 text-white px-6 sm:px-12 py-3 sm:py-4 rounded-full text-base sm:text-xl"
              >
                View My Trips
              </button>

              <button
                onClick={() => onNewChat ? onNewChat() : router.refresh()}
                className="bg-white border-2 border-purple-600 text-purple-700 px-6 sm:px-12 py-3 sm:py-4 rounded-full text-base sm:text-xl"
              >
                Start New Trip Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripPlanRenderer;