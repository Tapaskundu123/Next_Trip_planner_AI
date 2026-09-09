import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

// ✅ Viewport config (ALLOWED in server component)
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "AI Trip Planner — Plan Your Dream Trip in Seconds",
  description: "Describe your dream trip and get a personalised itinerary, hotel picks, budget breakdown and interactive map powered by Gemini AI — all in under 10 seconds.",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
