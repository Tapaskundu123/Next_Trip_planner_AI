"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowBigLeft, MapPin, Calendar, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface TripDetails {
  destination: string;
  duration: string;
  budget: string;
  group_size: string;
  origin: string;
  _id:string
}

const AllTripsPage = () => {
  const [trips, setTrips] = useState<TripDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/getViewAllTrips", {
          withCredentials: true,
        });

        if (res.status === 404) {
          toast.error("No Trips found");
        }

        setTrips(res.data.trips);
      } catch (err) {
        toast.error("Error loading trips");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

 
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-lg animate-pulse">
        Loading your trips...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Back Button */}
      <Button
        variant="ghost"
        className="flex items-center gap-2 mb-4 hover:bg-gray-100"
        onClick={() => router.push('/')}
      >
        <ArrowBigLeft className="w-5 h-5" /> Go Back
      </Button>

      <h1 className="text-4xl font-extrabold mb-6 text-gray-800">
        Your Saved Trips ✈️
      </h1>

      {trips.length === 0 ? (
        <p className="text-gray-500 text-center text-lg mt-10">
          You haven’t saved any trips yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-semibold">
                  {item.origin} → {item.destination}
                </h2>
              </div>

              <div className="space-y-2 text-gray-700">

                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  Duration: <span className="font-medium">{item.duration}</span>
                </p>

                <p className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-green-600" />
                  Budget: <span className="font-medium">{item.budget}</span>
                </p>

                <p className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  Group Size:{" "}
                  <span className="font-medium">{item.group_size}</span>
                </p>
              </div>
              <Button onClick={()=> router.push(`/my-trips/${item._id}`)}>View Details</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllTripsPage;
