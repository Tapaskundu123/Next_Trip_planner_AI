"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface TripDetails {
  destination: string;
  duration: string;
  budget: string;
  group_size: string;
}

const AllTripsPage = () => {
  const [trips, setTrips] = useState<TripDetails[]>([]);
  const [loading, setLoading] = useState(true);   // NEW

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/getViewAllTrips");

        if (res.status === 404) {
          toast.error("No Trips found");
        }

        setTrips(res.data.trips);
      } catch (err) {
        toast.error("Error loading trips");
      } finally {
        setLoading(false);   // STOP LOADING
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="p-6">Loading your trips...</p>;  // Show loader
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Saved Trips</h1>

      {trips.length === 0 ? (
        <p className="text-gray-500">No trips saved yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((item, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <h2 className="text-lg font-semibold">{item.destination}</h2>
              <p className="text-sm text-gray-600">Duration: {item.duration}</p>
              <p className="text-sm text-gray-600">Budget: {item.budget}</p>
              <p className="text-sm text-gray-600">Group Size: {item.group_size}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllTripsPage;
