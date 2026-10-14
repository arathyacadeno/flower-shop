"use client";

import React, { useRef } from "react";
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

  const handleHeroClick = () => {
    const nextEl =
      document.getElementById("category-section") ||
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
          src="/videos/OCCASIONS.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>
    </section>
  );
}

