// components/ShowingPlaceInMap.tsx

'use client';

import dynamic from 'next/dynamic';
import styles from './page.module.css';

// Dynamically import the heavy Leaflet map only on the client
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

export default function ShowingPlaceInMap() {
  return (
    <main className={styles.main}>
      <Map />
    </main>
  );
}