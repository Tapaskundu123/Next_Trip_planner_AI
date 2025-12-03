'use client'

import { SendHorizontal, DollarSign, Users, Calendar, Loader2 } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChatboxStart from './ChatboxStart';
import TripPlanRenderer from './TripPlanRenderer';
import { useTripStore } from '@/store/useTripStore';

interface ChatEntry {
  user: string;
  ai: string;
  ui?: string;
}

export interface TripPlan {
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

    // Show loading UI early when final plan is coming
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

      // Handle final trip plan (this was broken before!)
      if (data.ui === "final" && data.resp) {
        try {
          const plan: TripPlan = JSON.parse(data.resp);
          setCurrentPlan(plan);

          // Send plan to Zustand store so Map can read it
          useTripStore.getState().setCurrentPlan(plan);
        } catch (err) {
          console.error("Failed to parse trip plan JSON:", err);
        }
      }

      // Update AI response in chat
      setChatHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          ai: data.resp || "",
          ui: data.ui || "none"
        };
        return updated;
      });

      // Hide start screen after first interaction
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

    // Final trip plan — render the full UI
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

export default ChatwithAi;