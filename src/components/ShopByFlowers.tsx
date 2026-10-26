"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./ShopByFlowers.module.css";

interface FlowerCategory {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

const FLOWER_CATEGORIES: FlowerCategory[] = [
  {
    id: "roses",
    title: "Roses",
    description: "Romantic & timeless",
    image: "/images/flowers-roses-nobg.png",
    href: "/flowers/roses",
  },
  {
    id: "lilies",
    title: "Lilies",
    description: "Elegant & graceful",
    image: "/images/flowers-lilies-nobg.png",
    href: "/flowers/lilies",
  },
  {
    id: "sunflowers",
    title: "Sunflowers",
    description: "Bright & joyful",
    image: "/images/flowers-sunflowers-nobg.png",
    href: "/flowers/sunflowers",
  },
  {
    id: "tulips",
    title: "Tulips",
    description: "Sweet & charming",
    image: "/images/flowers-tulips-nobg.png",
    href: "/flowers/tulips",
  },
  {
    id: "carnations",
    title: "Carnations",
    description: "Charming & delicate",
    image: "/images/flowers-carnations-nobg.png",
    href: "/flowers/carnations",
  },
  {
    id: "peonies",
    title: "Peonies",
    description: "Lush & enchanting",
    image: "/images/flowers-peonies-nobg.png",
    href: "/flowers/peonies",
  },
  {
    id: "orchids",
    title: "Orchids",
    description: "Exotic & graceful",
    image: "/images/flowers-orchids-nobg.png",
    href: "/flowers/orchids",
  },
  {
    id: "pastel-tulips",
    title: "Pastel Tulips",
    description: "Sweet & poetic",
    image: "/images/flowers-pasteltulips-nobg.png",
    href: "/flowers/tulips",
  },
];

const ORIGINAL_COUNT = FLOWER_CATEGORIES.length;
const START_INDEX = ORIGINAL_COUNT;

// Create 3 sets (pre-clones, original, post-clones) for seamless infinite loop
const EXTENDED_ITEMS = [
  ...FLOWER_CATEGORIES.map((item, idx) => ({ ...item, uniqueKey: `pre-${idx}` })),
  ...FLOWER_CATEGORIES.map((item, idx) => ({ ...item, uniqueKey: `orig-${idx}` })),
  ...FLOWER_CATEGORIES.map((item, idx) => ({ ...item, uniqueKey: `post-${idx}` })),
];

export default function ShopByFlowers() {
  const [index, setIndex] = useState(START_INDEX);
  const [withTransition, setWithTransition] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);
  const [isPaused, setIsPaused] = useState(false);

  const isTransitioningRef = useRef(false);
  const pointerStartX = useRef<number | null>(null);
  const isPointerDown = useRef(false);

  // Responsive visible count so exactly whole cards fit (no side cut)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 560) {
        setVisibleCount(1);
      } else if (window.innerWidth < 860) {
        setVisibleCount(2);
      } else if (window.innerWidth < 1180) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Navigation handlers
  const handleNext = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setWithTransition(true);
    setIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setWithTransition(true);
    setIndex((prev) => prev - 1);
  };

  // Infinite loop wrap when transition ends
  const handleTransitionEnd = () => {
    isTransitioningRef.current = false;
    if (index >= START_INDEX + ORIGINAL_COUNT) {
      setWithTransition(false);
      setIndex((prev) => prev - ORIGINAL_COUNT);
    } else if (index < START_INDEX) {
      setWithTransition(false);
      setIndex((prev) => prev + ORIGINAL_COUNT);
    }
  };

  // Re-enable transition after teleport
  useEffect(() => {
    if (!withTransition) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWithTransition(true);
        });
      });
      return () => cancelAnimationFrame(id);
    }
  }, [withTransition]);

  // Gentle auto-slide (advances by 1 complete card every 3.8s)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 3800);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Touch / pointer swipe
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
    isPointerDown.current = true;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDown.current || pointerStartX.current === null) return;
    const diff = pointerStartX.current - e.clientX;
    isPointerDown.current = false;
    pointerStartX.current = null;

    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
  };

  return (
    <section
      className={styles.sectionWrapper}
      id="shop-by-flowers"
      aria-label="Shop by Flowers"
    >
      <span id="flowers" style={{ position: "relative", top: "-100px", visibility: "hidden" }} />
      <div className={styles.container}>
        {/* ================= SECTION HEADER ================= */}
        <div className={styles.sectionHeader}>
          <span className={styles.subtitle}>Curated Blooms</span>
          <h2 className={styles.mainTitle}>Shop By Flowers</h2>

          {/* Decorative floral icon with thin horizontal lines */}
          <div className={styles.floralDivider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="2.2" fill="#db2777" />
                <path
                  d="M12 4.5C12 4.5 10 7.5 10 9.5C10 10.6 10.9 11.5 12 11.5C13.1 11.5 14 10.6 14 9.5C14 7.5 12 4.5 12 4.5Z"
                  fill="#fbcfe8"
                  stroke="#db2777"
                  strokeWidth="0.8"
                />
                <path
                  d="M12 19.5C12 19.5 10 16.5 10 14.5C10 13.4 10.9 12.5 12 12.5C13.1 12.5 14 13.4 14 14.5C14 16.5 12 19.5 12 19.5Z"
                  fill="#fbcfe8"
                  stroke="#db2777"
                  strokeWidth="0.8"
                />
                <path
                  d="M4.5 12C4.5 12 7.5 10 9.5 10C10.6 10 11.5 10.9 11.5 12C11.5 13.1 10.6 14 9.5 14C7.5 14 4.5 12 4.5 12Z"
                  fill="#fbcfe8"
                  stroke="#db2777"
                  strokeWidth="0.8"
                />
                <path
                  d="M19.5 12C19.5 12 16.5 10 14.5 10C13.4 10 12.5 10.9 12.5 12C12.5 13.1 13.4 14 14.5 14C16.5 14 19.5 12 19.5 12Z"
                  fill="#fbcfe8"
                  stroke="#db2777"
                  strokeWidth="0.8"
                />
              </svg>
            </span>
            <span className={styles.dividerLine} />
          </div>
        </div>

        {/* ================= CAROUSEL WRAPPER WITH CONTROLS ================= */}
        <div
          className={styles.carouselOuter}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Circular Left Arrow */}
          <button
            type="button"
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={handlePrev}
            aria-label="Previous flower categories"
          >
            <ChevronLeft size={22} strokeWidth={2.2} />
          </button>

          {/* Slider Viewport: Exactly visibleCount whole cards, zero side cut */}
          <div
            className={styles.sliderViewport}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            <div
              className={styles.sliderTrack}
              onTransitionEnd={handleTransitionEnd}
              style={
                {
                  "--index": index,
                  "--visible-count": visibleCount,
                  "--gap": "28px",
                  transform: `translateX(calc(-1 * ${index} * ((100% + var(--gap, 28px)) / var(--visible-count, 4))))`,
                  transition: withTransition
                    ? "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
                    : "none",
                } as React.CSSProperties
              }
            >
              {EXTENDED_ITEMS.map((cat, idx) => (
                <div
                  key={`${cat.uniqueKey}-${idx}`}
                  className={styles.flowerItem}
                >
                  <Link
                    href={cat.href}
                    className={styles.itemInner}
                    aria-label={`Shop ${cat.title} bouquets`}
                  >
                    {/* Pastel Pink Circular Container with Bright Soft Pink Border */}
                    <div className={styles.circleContainer}>
                      <img
                        src={cat.image}
                        alt={`${cat.title} bouquet`}
                        className={styles.bouquetImg}
                        loading={idx < 12 ? "eager" : "lazy"}
                      />
                    </div>

                    {/* Flower Title */}
                    <div className={styles.infoArea}>
                      <h3 className={styles.flowerTitle}>{cat.title}</h3>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Circular Right Arrow */}
          <button
            type="button"
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={handleNext}
            aria-label="Next flower categories"
          >
            <ChevronRight size={22} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </section>
  );
}
