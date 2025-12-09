// store/useTripStore.ts
import { create } from 'zustand';
import { TripPlan } from '@/_components/ChatwithAi'; // Adjust path if needed

interface TripStore {
  currentPlan: TripPlan | null;
  setCurrentPlan: (plan: TripPlan | null) => void;

  // Optional: track active marker
  selectedPlace: {
    name: string;
    lat: number;
    lng: number;
  } | null;
  setSelectedPlace: (place: { name: string; lat: number; lng: number } | null) => void;
}

export const useTripStore = create<TripStore>((set) => ({
  currentPlan: null,
  setCurrentPlan: (plan) => set({ currentPlan: plan }),

  selectedPlace: null,
  setSelectedPlace: (place) => set({ selectedPlace: place }),
}));
