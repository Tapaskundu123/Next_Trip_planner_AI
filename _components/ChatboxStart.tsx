'use client'
import React from 'react'
import { ArrowRight, Sparkles, MapPin, Mountain } from 'lucide-react'; // Add lucide-react icons for attractiveness

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

      {/* Buttons in flex-col for vertical stack, attractive card-like */}
      <div className="flex flex-col space-y-4 max-w-md mx-auto">
        <button 
          onClick={() => setInput('Create New Trip')}
          className="group relative flex items-center justify-center p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-500 hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-200"
        >
          <div className="absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-6 h-6 text-orange-500" />
          </div>
          <span className="font-semibold text-gray-800 text-lg flex-1 text-left">Create New Trip</span>
          <div className="w-3 h-3 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <button 
          onClick={() => setInput('Inspire me where to go')}
          className="group relative flex items-center justify-center p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-500 hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-200"
        >
          <div className="absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles className="w-6 h-6 text-orange-500" />
          </div>
          <span className="font-semibold text-gray-800 text-lg flex-1 text-left">Inspire Me Where to Go</span>
          <div className="w-3 h-3 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <button 
          onClick={() => setInput('Discover Hidden Gems')}
          className="group relative flex items-center justify-center p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-500 hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-200"
        >
          <div className="absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <MapPin className="w-6 h-6 text-orange-500" />
          </div>
          <span className="font-semibold text-gray-800 text-lg flex-1 text-left">Discover Hidden Gems</span>
          <div className="w-3 h-3 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <button 
          onClick={() => setInput('Adventure Destination')}
          className="group relative flex items-center justify-center p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-500 hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-200 "
        >
          <div className="absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Mountain className="w-6 h-6 text-orange-500" />
          </div>
          <span className="font-semibold text-gray-800 text-lg flex-1 text-left">Adventure Destinations</span>
          <div className="w-3 h-3 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  )
}

export default ChatboxStart;