'use client'
import React from 'react'
import { ArrowRight, Sparkles, MapPin, Mountain } from 'lucide-react';

const ChatboxStart = ({ setInput }: { setInput: (msg: string) => void }) => {
  return (
    <div className="text-center space-y-8 max-w-lg mx-auto p-8">
      <div className="space-y-3">
        <h1 className="text-5xl font-bold text-gray-900 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          Start Your Adventure!
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Discover personalized travel itineraries, uncover hidden gems, and plan your dream journey with AI magic.
        </p>
      </div>

      <div className="flex flex-col space-y-4 max-w-md mx-auto">

        {/* Reusable button component structure */}
        {[
          { label: "Create New Trip", icon: <ArrowRight className="w-6 h-6 text-orange-500" />, input: "Create New Trip" },
          { label: "Inspire Me Where to Go", icon: <Sparkles className="w-6 h-6 text-orange-500" />, input: "Inspire me where to go" },
          { label: "Discover Hidden Gems", icon: <MapPin className="w-6 h-6 text-orange-500" />, input: "Discover Hidden Gems" },
          { label: "Adventure Destinations", icon: <Mountain className="w-6 h-6 text-orange-500" />, input: "Adventure Destination" },
        ].map((b, i) => (
          <button
            key={i}
            onClick={() => setInput(b.input)}
            className="group relative grid grid-cols-[40px_1fr_8px] items-center p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-500 hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-200"
          >
            {/* Left Icon (slides in on hover) */}
            <div className="opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-300">
              {b.icon}
            </div>

            {/* Text stays fixed — no shifting */}
            <span className="font-semibold text-gray-800 text-lg text-left">
              {b.label}
            </span>

            {/* Small orange dot */}
            <div className="w-3 h-3 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}

      </div>
    </div>
  )
}

export default ChatboxStart;
