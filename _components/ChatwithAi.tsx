'use client'

import { SendHorizontal } from 'lucide-react'; // Fixed import (was SendHorizonal)
import React, { useState } from 'react'
import toast from 'react-hot-toast';

interface ChatEntry {
  user: string;
  ai: string;
}

const ChatwithAi = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const resMessage = async (e: React.FormEvent) => { // Fixed: React.FormEvent
    e.preventDefault();

    if (!userInput.trim()) {
      toast.error("Please type something!");
      return;
    }

    const currentUserMessage = userInput;
    setUserInput("");
    setIsLoading(true);

    // STEP 1: Push user message with empty ai (or "typing...")
    setChatHistory(prev => [...prev, { user: currentUserMessage, ai: "" }]);

    try {
      const res = await fetch('/api/ai/message', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentUserMessage,
          history: chatHistory // Send history for context
        })
      });

      if (!res.ok) { // NEW: Check for API errors (e.g., 500)
        const errorData = await res.json();
        throw new Error(errorData.error || `API Error: ${res.status}`);
      }

      const data = await res.json();
      console.log('API Response:', data); // DEBUG: Remove later

      // STEP 2: Update last entry IMMUTABLY
      setChatHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { // Create new object
          ...updated[updated.length - 1],
          ai: data.reply || "No response received" // Fallback
        };
        return updated;
      });

      toast.success("Message sent!"); // Optional success feedback

    } catch (error: any) {
      // Handles both network & API errors
      console.error('Chat Error:', error); // DEBUG
      toast.error(error.message || "Something went wrong");

      // Optional: Add error to chat (e.g., "Sorry, AI is taking a break...")
      setChatHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          ai: "Oops! I couldn't respond. Try again?"
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full relative p-4 bg-gradient-to-b from-gray-50 to-white"> {/* Minor UI polish */}

      {/* Messages Section */}
      <div className="pb-32 overflow-y-auto h-full space-y-4">
        {chatHistory.map((entry, index) => (
          <div key={index} className="space-y-2">
            {/* USER Message */}
            <div className="flex justify-end">
              <div className="p-3 rounded-2xl max-w-[70%] bg-blue-500 text-white shadow-md">
                {entry.user}
              </div>
            </div>

            {/* AI Message */}
            <div className="flex justify-start">
              <div className={`p-3 rounded-2xl max-w-[70%] bg-gray-100 shadow-md ${entry.ai ? '' : 'opacity-50'}`}>
                {entry.ai || (isLoading && index === chatHistory.length - 1 ? '🤔 Thinking...' : '')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Section */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t">
        <form onSubmit={resMessage} className="relative flex items-end gap-2">
          <textarea
            className="flex-1 h-16 border-2 border-gray-300 rounded-2xl p-3 resize-none focus:border-blue-500 focus:outline-none"
            placeholder="Ask me anything about your trip..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !userInput.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white p-3 rounded-xl transition-colors flex-shrink-0"
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
};

export default ChatwithAi;