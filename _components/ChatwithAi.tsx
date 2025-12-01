'use client'

import { SendHorizontal, DollarSign, Users, Calendar, MapPin, Hotel, Sun, Star, Loader2 } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChatboxStart from './ChatboxStart';

interface ChatEntry {
  user: string;
  ai: string;
  ui?: string;
}

interface TripPlan {
  destination: string;
  duration: string;
  origin: string;
  budget: string;
  group_size: string;
  hotels: Array<{
    hotel_name: string;
    hotel_address: string;
    price_per_night: string;
    hotel_image_url: string;
    geo_coordinates: { latitude: number; longitude: number };
    rating: number;
    description: string;
  }>;
  itinerary: Array<{
    day: number;
    day_plan: string;
    best_time_to_visit_day: string;
    activities: Array<{
      place_name: string;
      place_details: string;
      place_image_url: string;
      geo_coordinates: { latitude: number; longitude: number };
      place_address: string;
      ticket_pricing: string;
      time_travel_each_location: string;
      best_time_to_visit: string;
    }>;
  }>;
}

const ChatwithAi = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<TripPlan | null>(null);
  const [showStartScreen, setShowStartScreen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const sendMessage = async (e?: React.FormEvent, customMessage?: string) => {
    e?.preventDefault();
    const messageToSend = customMessage?.trim() || userInput.trim();
    if (!messageToSend) {
      toast.error("Please enter a message!");
      return;
    }

    const userMessage = messageToSend;
    if (!customMessage) setUserInput("");
    setIsLoading(true);

    const newEntry: ChatEntry = { user: userMessage, ai: "", ui: "none" };
    setChatHistory(prev => [...prev, newEntry]);

    // Auto show loading when duration is likely being answered
    const isLikelyDuration = chatHistory.length >= 4 && /\d+/.test(userMessage);
    if (isLikelyDuration) {
      setChatHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          ai: "Perfect! Generating your personalized trip plan…",
          ui: "loading"
        };
        return updated;
      });
    }

    try {
      const res = await fetch('/api/ai/message', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: [...chatHistory, newEntry]
        })
      });

      if (!res.ok) throw new Error("Network error");

      const data = await res.json();

      // Handle final trip plan
      if (data.ui === "final" && data.resp) {
        try {
          const plan = JSON.parse(data.resp);
          setCurrentPlan(plan);
        } catch (err) {
          console.error("Failed to parse trip plan JSON:", err);
        }
      }

      // Update AI response
      setChatHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          ai: data.resp || "",
          ui: data.ui || "none"
        };
        return updated;
      });

      // Hide start screen after first message
      if (chatHistory.length === 0) {
        setShowStartScreen(false);
      }

    } catch (error) {
      toast.error("Failed to connect. Please try again.");
      setChatHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1].ai = "Sorry, I couldn't respond right now. Please try again later.";
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartClick = (message: string) => {
    setShowStartScreen(false);
    sendMessage(undefined, message);
  };

  const handleCardClick = (value: string) => {
    sendMessage(undefined, value);
  };

  const renderMessage = (text: string, ui: string): React.ReactNode => {
    if (ui === "loading") {
      return (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
          <p className="text-lg font-medium text-gray-700">{text || "Creating your dream trip…"}</p>
          <p className="text-sm text-gray-500 mt-2">This may take 10–20 seconds</p>
        </div>
      );
    }

    if (ui === "budget") {
      return (
        <div>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {["Low", "Medium", "High"].map((opt) => (
              <button
                key={opt}
                onClick={() => handleCardClick(opt)}
                className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-lg hover:scale-105 transition border border-green-200"
              >
                <DollarSign className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <div className="font-bold text-xl">{opt}</div>
                <div className="text-sm text-gray-600">Budget</div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (ui === "groupSize") {
      return (
        <div>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {["Solo", "Couple", "Family", "Friends"].map((opt) => (
              <button
                key={opt}
                onClick={() => handleCardClick(opt)}
                className="p-6 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl shadow-lg hover:scale-105 transition border border-blue-200"
              >
                <Users className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <div className="font-bold text-xl">{opt}</div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (ui === "tripDuration") {
      return (
        <div>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {["3-5 days", "7 days", "10+ days"].map((opt) => (
              <button
                key={opt}
                onClick={() => handleCardClick(opt)}
                className="p-6 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl shadow-lg hover:scale-105 transition border border-purple-200"
              >
                <Calendar className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                <div className="font-bold text-xl">{opt}</div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (ui === "final" && currentPlan) {
      return <TripPlanRenderer plan={currentPlan} />;
    }

    // Default: plain markdown
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>;
  };

  // Start Screen
  if (showStartScreen && chatHistory.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-8">
        <ChatboxStart setInput={handleStartClick} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-8">
        {chatHistory.map((entry, i) => (
          <div key={i} className="space-y-4">

            {/* User Message */}
            {entry.user && (
              <div className="flex justify-end">
                <div className="max-w-[75%] px-5 py-3 rounded-2xl bg-blue-500 text-white shadow-lg">
                  {entry.user}
                </div>
              </div>
            )}

            {/* AI Message */}
            <div className="flex justify-start">
              <div className="max-w-[90%] p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                {entry.ai ? (
                  renderMessage(entry.ai, entry.ui || "none")
                ) : (
                  i === chatHistory.length - 1 && isLoading && (
                    <div className="flex items-center gap-3 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t bg-white p-4">
        <form onSubmit={sendMessage} className="flex gap-3 max-w-4xl mx-auto">
          <textarea
            className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-2xl resize-none focus:border-orange-500 focus:outline-none transition text-base"
            placeholder="Tell me where you'd like to go..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isLoading}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="px-8 py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-2xl flex items-center gap-3 font-medium transition"
          >
            <SendHorizontal className="w-5 h-5" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

const TripPlanRenderer: React.FC<{ plan: TripPlan }> = ({ plan }) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-10 text-center md:text-left">
          <h1 className="text-5xl font-bold flex items-center justify-center md:justify-start gap-4">
            <MapPin className="w-14 h-14" />
            Trip to {plan.destination}
          </h1>
          <p className="text-xl mt-4 opacity-95">
            {plan.origin} → {plan.destination} • {plan.duration} • {plan.group_size} • {plan.budget} Budget
          </p>
        </div>
      </div>

      {/* Hotels */}
      <section>
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
          <Hotel className="w-10 h-10 text-orange-500" />
          Recommended Hotels
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plan.hotels.map((hotel, i) => (
            <div key={i} className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition">
              <div className="relative h-64 bg-gray-200">
                <Image
                  src={hotel.hotel_image_url || "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"}
                  alt={hotel.hotel_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold">{hotel.hotel_name}</h3>
                <p className="text-gray-600 mt-2">{hotel.description}</p>
                <div className="flex justify-between items-center mt-6">
                  <span className="text-3xl font-bold text-green-600">{hotel.price_per_night}/night</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${i < Math.floor(hotel.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-2 font-bold">{hotel.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">{hotel.hotel_address}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Itinerary */}
      <section>
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
          <Calendar className="w-10 h-10 text-purple-600" />
          Your Detailed Itinerary
        </h2>
        {plan.itinerary.map((day) => (
          <div key={day.day} className="bg-white rounded-3xl shadow-xl p-8 mb-10">
            <h3 className="text-3xl font-bold text-orange-600 mb-4">
              Day {day.day} <Sun className="inline w-8 h-8 text-yellow-500 ml-3" />
            </h3>
            <p className="text-xl italic text-gray-700 mb-8">{day.day_plan}</p>

            <div className="space-y-8">
              {day.activities.map((act, idx) => (
                <div key={idx} className="flex gap-6 bg-gray-50 rounded-2xl p-6">
                  <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                    <Image
                      src={act.place_image_url || "https://images.unsplash.com/photo-1499853873796-d20d0e0dfaa9?w=600"}
                      alt={act.place_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-800">{act.place_name}</h4>
                    <p className="text-gray-700 mt-3 leading-relaxed">{act.place_details}</p>
                    <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                      <div><strong>Address:</strong> {act.place_address}</div>
                      <div><strong>Tickets:</strong> {act.ticket_pricing}</div>
                      <div><strong>Best Time:</strong> {act.best_time_to_visit}</div>
                      <div><strong>Travel Time:</strong> {act.time_travel_each_location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="text-center py-12">
        <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-2xl font-bold px-16 py-6 rounded-full shadow-2xl hover:scale-105 transition transform">
          Book This Trip Now!
        </button>
      </div>
    </div>
  );
};

export default ChatwithAi;