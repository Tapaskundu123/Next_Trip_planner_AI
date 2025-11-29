"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import Image from "next/image";

export function PopularCity() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full py-20">
      <h2 className=" text-center text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        Most Loved Destinations This Season
      </h2>
      <Carousel items={cards} />
    </div>
  );
}

const DummyContent = () => {
  return (
    <>
      {[...new Array(3).fill(1)].map((_, index) => (
        <div
          key={"dummy-content" + index}
          className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4"
        >
          <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
            <span className="font-bold text-neutral-700 dark:text-neutral-200">
              Ready for your next adventure?
            </span>{" "}
            From breathtaking landscapes to vibrant city vibes — let’s plan the
            perfect getaway together.
          </p>
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=3540&auto=format&fit=crop"
            alt="Mountain landscape"
            height={500}
            width={500}
            className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain rounded-xl mt-6"
          />
        </div>
      ))}
    </>
  );
};

const data = [
  {
    category: "India",
    title: "Taj Mahal – A Wonder of the World",
    src: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=3540&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Japan",
    title: "Kyoto in Cherry Blossom Season",
    src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=3540&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Italy",
    title: "Amalfi Coast – Pure Magic",
    src: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=3540&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Iceland",
    title: "Chasing the Northern Lights",
    src: "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?q=80&w=3540&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Thailand",
    title: "Phi Phi Islands – Tropical Paradise",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=3540&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Maldives",
    title: "Swiss Alps & Crystal Lakes",
    src: "https://images.unsplash.com/photo-1540206395-68808572332f",
    content: <DummyContent />,
  },
  {
    category: "USA",
    title: "Santorini of America – Santorini, Greece (oops, Greece!)",
    src: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=3540&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Baali",
    title: "Machu Picchu – Lost City of the Incas",
    src: "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
    content: <DummyContent />,
  },
];