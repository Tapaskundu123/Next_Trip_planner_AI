// components/Map.tsx

'use client';

import React, { useRef, useEffect, useState } from 'react';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './map.module.css';
import { MaptilerLayer } from '@maptiler/leaflet-maptilersdk';

// Fix Leaflet marker icon 404 issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapComponent: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [searchInput, setSearchInput] = useState<string>('');

  const defaultCenter: LatLngExpression = [52.507932, 13.338414]; // Berlin
  const [zoom] = useState<number>(12);

  const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current, {
      center: defaultCenter,
      zoom: zoom,
    });

    new MaptilerLayer({
      apiKey: MAPTILER_KEY || '',
    }).addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [MAPTILER_KEY, zoom]);

  const searchPlace = async () => {
    if (!searchInput.trim() || !MAPTILER_KEY) {
      alert('Please enter a place name');
      return;
    }

    try {
      const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(searchInput)}.json?key=${MAPTILER_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data.features || data.features.length === 0) {
        alert('Place not found');
        return;
      }

      const [lng, lat] = data.features[0].center;
      const placeName = data.features[0].place_name;

      map.current?.flyTo([lat, lng], 14, { duration: 1.5 });

      // Remove previous markers
      map.current?.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.current?.removeLayer(layer);
        }
      });

      // Add new marker with popup
      L.marker([lat, lng])
        .addTo(map.current!)
        .bindPopup(`<b>${placeName}</b>`)
        .openPopup();
    } catch (err) {
      console.error('Search error:', err);
      alert('Search failed. Please try again.');
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* Search Bar */}
      <div
        className="absolute top-4 left-4 right-4 z-10 flex gap-2 bg-white shadow-lg rounded-lg p-3"
        style={{ zIndex: 1000 }}
      >
        <input
          type="text"
          placeholder="Search any place... (e.g. Paris, Tokyo)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchPlace()}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={searchPlace}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      {/* Map Container */}
      <div className={styles.mapWrap}>
        <div
          ref={mapContainer}
          className={styles.map}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default MapComponent;