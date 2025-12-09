// app/trip-planning/page.tsx
'use client';

import { useState } from "react";
import ChatwithAi from "@/_components/ChatwithAi";
import ShowingPlaceInMap from "@/_components/ShowingPlaceInMap";
import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TripPlanningPage() {
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Main Layout: Mobile = stacked, Desktop = side-by-side */}
      <div className="flex flex-col md:flex-row flex-1 h-full">
        
        {/* === CHAT SECTION === */}
        <section
          className={`
            flex-1 overflow-y-auto bg-white
            ${showMap ? "hidden md:block" : "block"} 
            md:w-1/2 md:border-r md:border-gray-200
          `}
        >
          <ChatwithAi />
        </section>

        {/* === MAP SECTION === */}
        <section
          className={`
            ${showMap ? "fixed" : "hidden"} md:relative 
            inset-0 z-40 md:z-0 
            md:block md:w-1/2 
            bg-white
            transition-transform duration-300 ease-in-out
            ${showMap ? "translate-x-0" : "translate-x-full md:translate-x-0"}
          `}
        >
          <div className="relative w-full h-full">
            {/* Close Button - Mobile Only */}
            <Button
              onClick={() => setShowMap(false)}
              variant="outline"
              size="icon"
              className="absolute top-4 left-4 z-50 md:hidden rounded-full bg-white/90 backdrop-blur shadow-xl hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Map Header */}
            <div className="absolute top-4 left-4 right-4 z-40 md:left-6 md:right-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-100">
              <p className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                Trip Locations
              </p>
              <p className="text-xs text-gray-600 mt-1">All hotels & activities are pinned</p>
            </div>

            {/* Map */}
            <div className="absolute inset-0">
              <ShowingPlaceInMap />
            </div>
          </div>
        </section>
      </div>

      {/* === MOBILE: Floating "Show Map" Button === */}
      {!showMap && (
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <Button
            onClick={() => setShowMap(true)}
            size="lg"
            className="rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-7 py-7 flex items-center gap-3 font-semibold"
          >
            <MapPin className="w-7 h-7" />
            View Map
          </Button>
        </div>
      )}
    </div>
  );
}