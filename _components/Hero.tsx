import { Button } from '@/components/ui/button';
import { Globe2, Landmark, Plane, Send } from 'lucide-react';
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";
import tripThumbnail from '../public/travel.png'

const Hero = () => {
  const suggestion = [
    { icon: <Globe2 className="text-blue-500 h-5 w-5" />, title: "Create new trip" },
    { icon: <Plane className="text-purple-500 h-5 w-5" />, title: "Inspire me where to go" },
    { icon: <Landmark className="text-green-500 h-5 w-5" />, title: "Discover hidden gems" },
    { icon: <Globe2 className="text-amber-500 h-5 w-5" />, title: "Adventure destinations" },
  ];

  return (
    <div className="flex flex-col justify-center items-center mt-10 px-4">

      {/* Heading */}
      <div className="flex flex-wrap justify-center items-center">
        <h1 className="font-bold text-5xl text-center">
          Hey, I'm your personal&nbsp;
        </h1>
        <span className="text-amber-500 text-5xl font-bold text-center">
          trip planner
        </span>
      </div>

      {/* Subtitle */}
      <p className="text-center mt-3 text-gray-700 max-w-[600px]">
        Tell me what you want, and I'll handle the rest — flights, hotels,
        itineraries — all in seconds.
      </p>

      {/* Input Box */}
      <div className="relative w-full max-w-[600px] mt-6">
        <textarea
          name="trip"
          id="trip"
          placeholder="Describe your trip…"
          className="border-2 border-black rounded-xl w-full h-24 p-4 text-base resize-none"
        ></textarea>

        <Button type="submit" className="absolute right-3 bottom-3 rounded-xl px-4">
          <Send className="text-white" size={18} />
        </Button>
      </div>

      {/* Suggestions */}
      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {suggestion.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-2 border rounded-xl px-4 py-2
                       cursor-pointer hover:bg-gray-100 transition"
          >
            {item.icon}
            <p className="text-sm font-medium">{item.title}</p>
          </li>
        ))}
      </ul>

      {/* How it works */}
      <h2 className="mt-10 text-xl font-medium text-gray-800 text-center">
        Not sure where to start?{" "}
        <strong className="text-black">See how it works</strong>
      </h2>

      {/* Video Preview */}
  <div className="mt-8 w-full flex justify-center">
  <div className="relative w-full max-w-[900px] h-[280px] sm:h-[400px] md:h-[520px] rounded-2xl overflow-hidden shadow-2xl">
    <HeroVideoDialog
      className="absolute inset-0 w-full h-full"
      animationStyle="from-center"
      videoSrc="https://cdn.magicui.design/demo-video.mp4"
      thumbnailSrc={tripThumbnail.src}
      thumbnailAlt="See how it works"
    />
  </div>
</div>
    </div>
  );
};

export default Hero;
