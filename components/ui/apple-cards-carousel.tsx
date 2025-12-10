"use client";

import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion"; // Fixed import (was "motion/react")
import Image, { type ImageProps } from "next/image";
import { useOutsideClick } from "@/hooks/use-outside-click";

/* ---------------- Types ---------------- */

interface CarouselProps {
  items: React.ReactNode[];
  initialScroll?: number;
}

type CardType = {
  src: string;
  title: string;
  category: string;
  content: React.ReactNode;
};

/* ---------------- Context ---------------- */

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

/* ---------------- Carousel ---------------- */

export const Carousel = ({
  items,
  initialScroll = 0,
}: CarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
  };

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  const handleCardClose = useCallback((index: number) => {
    if (!carouselRef.current) return;
    const cardWidth = window.innerWidth < 768 ? 230 : 384;
    const gap = window.innerWidth < 768 ? 4 : 8;

    carouselRef.current.scrollTo({
      left: (cardWidth + gap) * (index + 1),
      behavior: "smooth",
    });

    setCurrentIndex(index);
  }, []);

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full">
        <div
          ref={carouselRef}
          onScroll={checkScrollability}
          className="flex w-full overflow-x-scroll scroll-smooth py-10 [scrollbar-width:none] md:py-20"
        >
          <div className="absolute right-0 z-[1000] h-auto w-[5%] bg-gradient-to-l" />

          <div className="mx-auto flex max-w-7xl gap-4 pl-4">
            {items.map((item, index) => (
              <motion.div
                key={`card-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.2 * index,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
                className="rounded-3xl last:pr-[5%] md:last:pr-[33%]"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mr-10 flex justify-end gap-2">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
          >
            <IconArrowNarrowLeft className="h-6 w-6 text-gray-500" />
          </button>

          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
          >
            <IconArrowNarrowRight className="h-6 w-6 text-gray-500" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

/* ---------------- Card ---------------- */

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: CardType;
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  // Define handleClose FIRST, before using it in hooks/effects
  const handleClose = useCallback(() => {
    setOpen(false);
    onCardClose(index);
  }, [setOpen, onCardClose, index]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  // Now use handleClose safely
  useOutsideClick(containerRef, handleClose);

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50">
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="relative z-[60] mx-auto my-10 max-w-5xl rounded-3xl bg-white p-4 md:p-10 dark:bg-neutral-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                onClick={handleClose}
                className="sticky right-0 top-4 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white"
              >
                <IconX className="h-6 w-6 text-white dark:text-black" />
              </button>

              <p className="text-base font-medium">{card.category}</p>
              <p className="mt-4 text-2xl font-semibold md:text-5xl">
                {card.title}
              </p>

              <div className="py-10">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={() => setOpen(true)}
        className="relative z-10 flex h-80 w-56 overflow-hidden rounded-3xl bg-gray-100 md:h-[40rem] md:w-96"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />

        <div className="relative z-40 p-8 text-white">
          <p className="text-sm md:text-base">{card.category}</p>
          <p className="mt-2 text-xl font-semibold md:text-3xl">
            {card.title}
          </p>
        </div>

        <BlurImage
          src={card.src}
          alt={card.title}
          fill
          className="absolute inset-0 object-cover"
        />
      </motion.button>
    </>
  );
};

/* ---------------- Blur Image ---------------- */

export const BlurImage = ({
  src,
  alt,
  className,
  ...rest
}: ImageProps) => {
  const [loading, setLoading] = useState(true);

  return (
    <Image
      {...rest}
      src={src}
      alt={alt || "Background image"}
      onLoad={() => setLoading(false)}
      className={cn(
        "transition duration-300",
        loading ? "blur-sm" : "blur-0",
        className
      )}
    />
  );
};