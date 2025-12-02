import mongoose from "mongoose";

export interface TripSave {
  user: mongoose.Types.ObjectId; // user id
  destination: string;
  duration: string;
  origin: string;
  budget: string;
  group_size: string;
  hotels: {
    hotel_name: string;
    hotel_address: string;
    price_per_night: string;
    hotel_image_url: string;
    geo_coordinates: { latitude: number; longitude: number };
    rating: number;
    description: string;
  }[];
  itinerary: {
    day: number;
    day_plan: string;
    best_time_to_visit_day: string;
    activities: {
      place_name: string;
      place_details: string;
      place_image_url: string;
      geo_coordinates: { latitude: number; longitude: number };
      place_address: string;
      ticket_pricing: string;
      time_travel_each_location: string;
      best_time_to_visit: string;
    }[];
  }[];
}

const TripSchema = new mongoose.Schema<TripSave>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // IMPORTANT: use string "User", not imported model
      required: true,
    },

    destination: String,
    duration: String,
    origin: String,
    budget: String,
    group_size: String,

    hotels: [
      {
        hotel_name: String,
        hotel_address: String,
        price_per_night: String,
        hotel_image_url: String,
        geo_coordinates: {
          latitude: Number,
          longitude: Number,
        },
        rating: Number,
        description: String,
      },
    ],

    itinerary: [
      {
        day: Number,
        day_plan: String,
        best_time_to_visit_day: String,
        activities: [
          {
            place_name: String,
            place_details: String,
            place_image_url: String,
            geo_coordinates: {
              latitude: Number,
              longitude: Number,
            },
            place_address: String,
            ticket_pricing: String,
            time_travel_each_location: String,
            best_time_to_visit: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export const Trip =
  mongoose.models.Trip || mongoose.model<TripSave>("Trip", TripSchema);
