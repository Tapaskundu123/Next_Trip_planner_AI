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
            ${showMap ? "fixed inset-0 z-50" : "hidden"} 
            md:relative md:inset-0 md:z-0 
            md:block md:w-1/2 
            bg-white
            transition-all duration-300 ease-in-out
            ${showMap ? "scale-100 opacity-100" : "scale-95 opacity-0 md:scale-100 md:opacity-100"}
          `}
        >
          <div className="relative w-full h-screen"> {/* ⭐ Full h-screen for mobile */}
            {/* Close Button - Mobile Only */}
            <Button
              onClick={() => setShowMap(false)}
              variant="outline"
              size="icon"
              className="absolute top-4 left-4 z-50 rounded-full bg-white/95 backdrop-blur-sm shadow-xl hover:bg-gray-100 border-gray-200"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Map Header - Non-overlapping */}
            <div className="absolute top-4 left-4 right-4 z-40 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 sm:p-4 border border-gray-100">
              <p className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                Trip Locations
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">All hotels & activities are pinned</p>
            </div>

            {/* Map - Full height */}
            <div className="absolute inset-0">
              <ShowingPlaceInMap />
            </div>
          </div>
        </section>
      </div>

      {/* === MOBILE: Floating "Show Map" Button - Moved up to avoid send btn overlap === */}
      {!showMap && (
        <div className="fixed bottom-28 right-6 z-50 md:hidden"> {/* ⭐ bottom-28: Above input bar */}
          <Button
            onClick={() => setShowMap(true)}
            size="lg"
            className="rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 flex items-center gap-2 font-semibold shadow-lg"
          >
            <MapPin className="w-5 h-5" />
            <span className="hidden sm:inline">View Map</span>
          </Button>
        </div>
      )}
    </div>
  );
}