"use client";

import React, { useRef, useEffect } from "react";
import styles from "./SplitHero.module.css";

interface SplitHeroProps {
  onOpenMenu?: () => void;
  targetSlide?: number;
  onSlideChange?: (slide: number) => void;
}

export default function SplitHero({
  onOpenMenu,
}: SplitHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, []);

  const handleHeroClick = () => {
    const nextEl =
      document.getElementById("categories") ||
      document.getElementById("shop-by-category") ||
      document.getElementById("highlights");
    if (nextEl) {
      nextEl.scrollIntoView({ behavior: "smooth" });
    } else if (onOpenMenu) {
      onOpenMenu();
    }
  };

  return (
    <section
      className={styles.heroSection}
      id="hero-slider"
      onClick={handleHeroClick}
      aria-label="Occasions Floral Hero Video"
    >
      <div className={styles.videoContainer}>
        <video
          ref={videoRef}
          className={styles.heroVideo}
          src="/videos/Header%20Expanded.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/videos/Header%20Expanded.mp4" type="video/mp4" />
          <source src="/videos/Header Expanded.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}

