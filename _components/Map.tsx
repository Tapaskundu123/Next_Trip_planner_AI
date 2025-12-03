// components/ShowingPlaceInMap.tsx (or wherever it is)
'use client';

import React, { useRef, useEffect } from 'react';
import L, { LatLngExpression, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MaptilerLayer } from '@maptiler/leaflet-maptilersdk';
import { useTripStore } from '@/store/useTripStore';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ShowingPlaceInMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  const { currentPlan } = useTripStore();

  const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initialCenter: LatLngExpression = [20, 0]; // World view initially
    map.current = L.map(mapContainer.current, {
      center: initialCenter,
      zoom: 2,
    });

    new MaptilerLayer({
      apiKey: MAPTILER_KEY || '',
    }).addTo(map.current);

    // Create a layer group for markers (so we can clear them easily)
    markersLayer.current = L.layerGroup().addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [MAPTILER_KEY]);

  // Watch for trip plan changes and add markers
  useEffect(() => {
    if (!map.current || !markersLayer.current || !currentPlan) return;

    // Clear previous markers
    markersLayer.current.clearLayers();

    const hotelCoords = currentPlan.hotels[0]?.geo_coordinates;
    const bounds = L.latLngBounds([]);

    // Add Hotel Markers
    currentPlan.hotels.forEach((hotel) => {
      const { latitude, longitude } = hotel.geo_coordinates;
      if (!latitude || !longitude) return;

      const marker = L.marker([latitude, longitude], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background:#f97316; width:14px; height:14px; border-radius:50%; border:3px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
        }),
      });

      marker
        .addTo(markersLayer.current!)
        .bindPopup(`
          <div class="font-bold text-orange-600">${hotel.hotel_name}</div>
          <div class="text-sm">${hotel.hotel_address}</div>
          <div class="text-sm font-medium">$${hotel.price_per_night}/night</div>
        `);

      bounds.extend([latitude, longitude]);
    });

    // Add Activity Markers
    currentPlan.itinerary.forEach((day) => {
      day.activities.forEach((activity) => {
        const { latitude, longitude } = activity.geo_coordinates;
        if (!latitude || !longitude) return;

        const marker = L.marker([latitude, longitude]);

        marker
          .addTo(markersLayer.current!)
          .bindPopup(`
            <div class="font-bold">${activity.place_name}</div>
            <div class="text-xs text-gray-600">Day ${day.day}</div>
            <div class="text-sm mt-1">${activity.place_details}</div>
            ${activity.ticket_pricing !== "Free" ? `<div class="text-sm font-medium text-green-600 mt-1">${activity.ticket_pricing}</div>` : ''}
          `);

        bounds.extend([latitude, longitude]);
      });
    });

    // Fit map to all markers (with padding)
    if (bounds.isValid()) {
      map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (hotelCoords) {
      map.current.setView([hotelCoords.latitude, hotelCoords.longitude], 12);
    }
  }, [currentPlan]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={mapContainer}
        style={{ width: '100%', height: '100%' }}
      />
      {currentPlan && (
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-gray-700">
          {currentPlan.destination} • {currentPlan.duration}
        </div>
      )}
    </div>
  );
};

export default ShowingPlaceInMap;