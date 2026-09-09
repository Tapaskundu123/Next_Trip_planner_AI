"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Activity {
  place_name: string;
  place_details: string;
  geo_coordinates: { latitude: number; longitude: number };
  place_address: string;
  ticket_pricing: string;
  best_time_to_visit: string;
}

interface ItineraryDay {
  day: number;
  day_plan: string;
  activities: Activity[];
}

interface Hotel {
  hotel_name: string;
  hotel_address: string;
  price_per_night: string;
  geo_coordinates: { latitude: number; longitude: number };
  rating: number;
  description: string;
}

interface ItineraryMapProps {
  hotels: Hotel[];
  itinerary: ItineraryDay[];
  destination: string;
}

const DAY_COLORS = [
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
];

const ItineraryMap: React.FC<ItineraryMapProps> = ({ hotels, itinerary, destination }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(0); // 0 = all hotels + all activities
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;
    const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (!MAPTILER_KEY) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`,
      center: [78.9629, 20.5937],
      zoom: 4,
    });

    mapInstance.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => setMapLoaded(true));

    return () => {
      markersRef.current.forEach(m => m.remove());
      map.remove();
    };
  }, []);

  // Render markers when map loads or selectedDay changes
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current) return;
    const map = mapInstance.current;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Remove old route layers
    if (map.getLayer("route-line")) map.removeLayer("route-line");
    if (map.getSource("route-source")) map.removeSource("route-source");

    const bounds = new maplibregl.LngLatBounds();
    const routeCoords: [number, number][] = [];

    // Hotel markers (always shown)
    hotels.forEach((hotel) => {
      const { latitude, longitude } = hotel.geo_coordinates;
      if (!latitude || !longitude) return;

      const el = document.createElement("div");
      el.style.cssText = `
        width: 36px; height: 36px;
        background: linear-gradient(135deg, #f97316, #ea580c);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(249,115,22,0.5);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
      `;
      el.innerHTML = `<span style="transform:rotate(45deg);font-size:14px;">🏨</span>`;

      const popup = new maplibregl.Popup({ offset: 25, className: "custom-popup" }).setHTML(`
        <div style="font-family:sans-serif;max-width:220px;padding:4px;">
          <div style="font-weight:700;font-size:14px;color:#1f2937;margin-bottom:4px;">🏨 ${hotel.hotel_name}</div>
          <div style="color:#059669;font-weight:600;font-size:13px;">${hotel.price_per_night}/night</div>
          <div style="color:#6b7280;font-size:12px;margin-top:2px;">⭐ ${hotel.rating} · ${hotel.hotel_address}</div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([longitude, latitude]);
    });

    // Activity markers based on selected day
    const daysToShow = selectedDay === 0
      ? itinerary
      : itinerary.filter(d => d.day === selectedDay);

    daysToShow.forEach((day) => {
      const color = DAY_COLORS[(day.day - 1) % DAY_COLORS.length];

      day.activities.forEach((act, idx) => {
        const { latitude, longitude } = act.geo_coordinates;
        if (!latitude || !longitude) return;

        routeCoords.push([longitude, latitude]);

        const el = document.createElement("div");
        el.style.cssText = `
          width: 32px; height: 32px;
          background: ${color};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px ${color}80;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 700; font-size: 12px;
        `;
        el.textContent = `${idx + 1}`;

        const popup = new maplibregl.Popup({ offset: 20 }).setHTML(`
          <div style="font-family:sans-serif;max-width:240px;padding:4px;">
            <div style="background:${color};color:white;font-size:11px;font-weight:600;padding:2px 8px;border-radius:12px;display:inline-block;margin-bottom:6px;">
              Day ${day.day} · Stop ${idx + 1}
            </div>
            <div style="font-weight:700;font-size:14px;color:#1f2937;margin-bottom:4px;">${act.place_name}</div>
            <div style="color:#6b7280;font-size:12px;line-height:1.4;">${act.place_details.slice(0, 100)}${act.place_details.length > 100 ? '...' : ''}</div>
            <div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap;">
              <span style="background:#fef3c7;color:#92400e;font-size:11px;padding:2px 6px;border-radius:8px;">🎫 ${act.ticket_pricing}</span>
              <span style="background:#ede9fe;color:#7c3aed;font-size:11px;padding:2px 6px;border-radius:8px;">⏰ ${act.best_time_to_visit}</span>
            </div>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
        bounds.extend([longitude, latitude]);
      });
    });

    // Draw route line connecting activities for single day view
    if (selectedDay !== 0 && routeCoords.length > 1) {
      map.addSource("route-source", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: routeCoords },
        },
      });

      const color = DAY_COLORS[(selectedDay - 1) % DAY_COLORS.length];
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route-source",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": color,
          "line-width": 3,
          "line-opacity": 0.7,
          "line-dasharray": [2, 2],
        },
      });
    }

    // Fit map to all visible markers
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 800 });
    }
  }, [mapLoaded, selectedDay, hotels, itinerary]);

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
      {/* Day Selector Tabs */}
      <div className="bg-gray-900 px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setSelectedDay(0)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            selectedDay === 0
              ? "bg-white text-gray-900 shadow-md"
              : "text-gray-300 hover:text-white hover:bg-white/10"
          }`}
        >
          🗺️ All
        </button>
        {itinerary.map((day) => {
          const color = DAY_COLORS[(day.day - 1) % DAY_COLORS.length];
          return (
            <button
              key={day.day}
              onClick={() => setSelectedDay(day.day)}
              style={selectedDay === day.day ? { backgroundColor: color } : {}}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedDay === day.day
                  ? "text-white shadow-md"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              Day {day.day}
            </button>
          );
        })}
      </div>

      {/* Day Plan Summary */}
      {selectedDay !== 0 && (
        <div
          className="px-4 py-2.5 text-sm font-medium text-white"
          style={{ backgroundColor: DAY_COLORS[(selectedDay - 1) % DAY_COLORS.length] }}
        >
          📍 {itinerary.find(d => d.day === selectedDay)?.day_plan}
        </div>
      )}

      {/* Map */}
      <div className="relative w-full h-[420px] md:h-[520px]">
        <div ref={mapRef} className="w-full h-full" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-300 text-sm">Loading map…</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-900 px-4 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-gray-300 text-xs">
          <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white" />
          Hotels
        </div>
        {itinerary.slice(0, 4).map((day) => (
          <div key={day.day} className="flex items-center gap-2 text-gray-300 text-xs">
            <div
              className="w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: DAY_COLORS[(day.day - 1) % DAY_COLORS.length] }}
            />
            Day {day.day}
          </div>
        ))}
        {itinerary.length > 4 && (
          <span className="text-gray-500 text-xs">+{itinerary.length - 4} more days</span>
        )}
      </div>
    </div>
  );
};

export default ItineraryMap;
