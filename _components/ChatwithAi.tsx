'use client'

import { SendHorizontal, DollarSign, Users, Calendar, Loader2, Mic, MicOff, Plus } from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChatboxStart from './ChatboxStart';
import TripPlanRenderer from './TripPlanRenderer';
import VoiceInput from './VoiceInput';
import { useTripStore } from '@/store/useTripStore';
import { useSearchParams, useRouter } from 'next/navigation';

interface ChatEntry {
  user: string;
  ai: string;
  ui?: string;
}

export interface TripPlan {
  destination: string;
  duration: string;
  startDate?: string;
  origin: string;
  budget: string;
  group_size: string;
  weather_note?: string;
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [hasAutoSent, setHasAutoSent] = useState(false);
  const [streamingText, setStreamingText] = useState(""); // live token accumulator
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { setCurrentPlan, currentPlan } = useTripStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleNewChat = useCallback(() => {
    setChatHistory([]);
    setCurrentPlan(null);
    setShowStartScreen(true);
    setUserInput("");
    setHasAutoSent(false);
    setStreamingText("");
    router.replace('/create-new-trip');
    toast.success("Starting a new trip chat!");
  }, [setCurrentPlan, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, streamingText]);

  useEffect(() => {
    const message = searchParams.get('message');
    if (message && !hasAutoSent && chatHistory.length === 0) {
      setHasAutoSent(true);
      setShowStartScreen(false);
      sendMessage(undefined, message);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, hasAutoSent]);

  const sendMessage = async (e?: React.FormEvent, customMessage?: string) => {
    e?.preventDefault();
    const messageToSend = customMessage?.trim() || userInput.trim();
    if (!messageToSend) {
      toast.error("Please enter a message!");
      return;
    }

    // Abort any existing stream
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const userMessage = messageToSend;
    if (!customMessage) setUserInput("");
    setIsLoading(true);
    setStreamingText("");
    setShowStartScreen(false);

    const newEntry: ChatEntry = { user: userMessage, ai: "", ui: "streaming" };
    setChatHistory(prev => [...prev, newEntry]);

    try {
      const res = await fetch('/api/ai/message', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory,
          startDate: selectedDate || undefined,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("Network error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || ""; // keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr);

            if (parsed.token) {
              // Streaming token
              accumulated += parsed.token;
              setStreamingText(accumulated);
            } else if (parsed.type === "done") {
              // Final structured response
              const data = parsed.data;
              setStreamingText("");

              if (data.ui === "final" && data.trip_plan) {
                let plan: TripPlan = typeof data.trip_plan === 'string'
                  ? JSON.parse(data.trip_plan)
                  : data.trip_plan;

                if (!plan.destination || plan.hotels.length === 0 || plan.itinerary.length === 0) {
                  throw new Error("Incomplete trip plan received.");
                }

                setCurrentPlan(plan);
                setChatHistory(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    ai: data.resp || "✨ Your trip plan is ready!",
                    ui: "final",
                  };
                  return updated;
                });
                toast.success("Trip plan generated successfully!");
              } else {
                setChatHistory(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    ai: data.resp || "",
                    ui: data.ui || "none",
                  };
                  return updated;
                });

                // Show date picker if requested
                if (data.ui === "datePicker") {
                  setShowDatePicker(true);
                }
              }
            } else if (parsed.type === "error") {
              throw new Error(parsed.message || "Stream error");
            }
          } catch (parseErr) {
            // Skip malformed chunks
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Chat error:", error);
      const errorMsg = error.message.includes("Incomplete")
        ? "Trip plan incomplete – try a simpler query."
        : "Failed to connect. Please try again.";
      toast.error(errorMsg);
      setStreamingText("");

      setChatHistory(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            ai: errorMsg,
            ui: "none",
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
      setStreamingText("");
    }
  };

  const handleStartClick = (message: string) => sendMessage(undefined, message);
  const handleCardClick = (value: string) => sendMessage(undefined, value);

  const handleDateSubmit = () => {
    if (!selectedDate) {
      toast.error("Please select a travel date");
      return;
    }
    setShowDatePicker(false);
    sendMessage(undefined, `I plan to travel starting ${new Date(selectedDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}`);
  };

  const renderMessage = (text: string, ui: string, isLast: boolean): React.ReactNode => {
    // Live streaming state
    if (ui === "streaming" && isLast && (streamingText || isLoading)) {
      const display = streamingText || "";
      return (
        <div className="space-y-2">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{display}</ReactMarkdown>
          </div>
          {isLoading && (
            <span className="inline-block w-2 h-5 bg-orange-500 animate-pulse rounded-sm ml-1" />
          )}
        </div>
      );
    }

    if (ui === "loading") {
      return (
        <div className="flex flex-col items-center py-8">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
          <p className="text-lg font-medium text-gray-700">{text || "Creating your dream trip…"}</p>
          <p className="text-sm text-gray-500 mt-2">This may take 15–30 seconds</p>
        </div>
      );
    }

    if (ui === "budget") {
      return (
        <div>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Low", emoji: "💚", desc: "Budget-friendly", color: "from-green-50 to-emerald-100 border-green-200" },
              { label: "Medium", emoji: "💛", desc: "Comfortable", color: "from-yellow-50 to-amber-100 border-amber-200" },
              { label: "High", emoji: "💎", desc: "Luxury", color: "from-purple-50 to-violet-100 border-purple-200" },
            ].map(({ label, emoji, desc, color }) => (
              <button
                key={label}
                onClick={() => handleCardClick(label)}
                disabled={isLoading}
                className={`p-5 bg-gradient-to-br ${color} rounded-2xl shadow-md hover:scale-105 transition-transform border disabled:opacity-50 text-left`}
              >
                <div className="text-3xl mb-2">{emoji}</div>
                <div className="font-bold text-base">{label}</div>
                <div className="text-xs text-gray-500 mt-1">{desc}</div>
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
          <div className="grid grid-cols-2 gap-3 mt-5">
            {[
              { label: "Solo", emoji: "🧍", desc: "Just me" },
              { label: "Couple", emoji: "👫", desc: "2 people" },
              { label: "Family", emoji: "👨‍👩‍👧", desc: "With kids" },
              { label: "Friends", emoji: "👥", desc: "Group trip" },
            ].map(({ label, emoji, desc }) => (
              <button
                key={label}
                onClick={() => handleCardClick(label)}
                disabled={isLoading}
                className="p-5 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl shadow-md hover:scale-105 transition-transform border border-blue-200 disabled:opacity-50 text-left"
              >
                <div className="text-3xl mb-2">{emoji}</div>
                <div className="font-bold text-base">{label}</div>
                <div className="text-xs text-gray-500 mt-1">{desc}</div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (ui === "datePicker") {
      return (
        <div>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          <div className="mt-5 p-5 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl border border-indigo-200 shadow-md">
            <p className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Select your travel start date
            </p>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:border-indigo-500 focus:outline-none bg-white text-gray-800 text-base"
            />
            <button
              onClick={handleDateSubmit}
              disabled={!selectedDate}
              className="mt-3 w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold transition"
            >
              Confirm Date →
            </button>
          </div>
        </div>
      );
    }

    if (ui === "tripDuration") {
      return (
        <div>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "3–5 days", emoji: "⚡" },
              { label: "7 days", emoji: "🗓️" },
              { label: "10+ days", emoji: "🌍" },
            ].map(({ label, emoji }) => (
              <button
                key={label}
                onClick={() => handleCardClick(label)}
                disabled={isLoading}
                className="p-5 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl shadow-md hover:scale-105 transition-transform border border-purple-200 disabled:opacity-50"
              >
                <div className="text-3xl mb-2">{emoji}</div>
                <div className="font-bold text-sm">{label}</div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (ui === "final" && currentPlan) {
      return <TripPlanRenderer plan={currentPlan} onNewChat={handleNewChat} />;
    }

    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>;
  };

  if (showStartScreen && chatHistory.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-8">
        <ChatboxStart setInput={handleStartClick} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-600">AI Trip Planner</span>
        </div>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium border border-orange-200 hover:border-orange-300 px-3 py-1.5 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-5 pb-28 space-y-6">
        {chatHistory.map((entry, i) => (
          <div key={i} className="space-y-3">
            {/* User Message */}
            {entry.user && (
              <div className="flex justify-end">
                <div className="max-w-[75%] px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg text-sm md:text-base">
                  {entry.user}
                </div>
              </div>
            )}

            {/* AI Message */}
            <div className="flex justify-start">
              <div className="max-w-[92%] md:max-w-[88%] p-5 bg-white rounded-2xl shadow-lg border border-gray-100">
                {entry.ai || (i === chatHistory.length - 1 && (isLoading || streamingText)) ? (
                  renderMessage(entry.ai, entry.ui || "none", i === chatHistory.length - 1)
                ) : (
                  i === chatHistory.length - 1 && isLoading && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking…</span>
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
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur-sm px-4 py-3 md:relative md:bottom-auto">
        <form onSubmit={sendMessage} className="flex gap-2 max-w-4xl mx-auto">
          <textarea
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl resize-none focus:border-orange-400 focus:outline-none transition text-sm md:text-base bg-gray-50 focus:bg-white"
            placeholder="Tell me where you'd like to go…"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            disabled={isLoading}
            rows={1}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          {/* Voice Input */}
          <VoiceInput onTranscript={text => setUserInput(prev => prev + text)} disabled={isLoading} />

          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-40 text-white rounded-2xl flex items-center gap-2 font-medium transition shadow-md"
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatwithAi;