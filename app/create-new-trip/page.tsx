'use client';

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import TripWizard from "@/_components/TripWizard";

export default function TripPlanningPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mx-auto mb-3" />
            <p className="text-indigo-300 text-sm">Loading Trip Planner…</p>
          </div>
        </div>
      }
    >
      <TripWizard />
    </Suspense>
  );
}