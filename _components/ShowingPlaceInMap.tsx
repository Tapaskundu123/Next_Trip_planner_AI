'use client';

import dynamic from 'next/dynamic';
import { useTripStore } from '@/store/useTripStore';
import styles from './page.module.css';

// Dynamically import the heavy Leaflet map only on the client
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-900">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-300 text-sm">Loading map…</p>
      </div>
    </div>
  ),
});

export default function ShowingPlaceInMap() {
  const { currentPlan } = useTripStore();

  // Pass plan data to the map via query params if needed
  // The Map component can consume from Zustand directly
  return (
    <main className={styles.main}>
      <Map />
      {currentPlan && (
        <div className="absolute top-4 left-4 right-16 z-50 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-gray-100">
            <p className="text-sm font-bold text-gray-800">
              📍 {currentPlan.destination}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {currentPlan.hotels?.length || 0} hotels · {currentPlan.itinerary?.reduce((sum, d) => sum + d.activities.length, 0) || 0} activities
            </p>
          </div>
        </div>
      )}
    </main>
  );
}