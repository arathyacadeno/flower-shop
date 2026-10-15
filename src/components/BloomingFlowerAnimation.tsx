"use client";

import React, { useRef, useEffect } from "react";

interface BloomingFlowerProps {
  className?: string;
}

export default function BloomingFlowerAnimation({ className }: BloomingFlowerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !container) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animId: number | null = null;
    let isIntersecting = false;

    const processFrame = () => {
      if (isIntersecting && video.readyState >= 2 && !video.paused && !video.ended) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 360;
          canvas.height = video.videoHeight || 480;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;
        const len = data.length;

        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const min = Math.min(r, g, b);
          const max = Math.max(r, g, b);
          const diff = max - min;

          // Key out neutral off-white / light-grey video background
          if (min > 215 && diff < 24) {
            if (min > 236 && diff < 15) {
              data[i + 3] = 0;
            } else {
              const t = (236 - min) / 21;
              data[i + 3] = Math.round(Math.min(255, Math.max(0, t * data[i + 3])));
            }
          }
        }

        ctx.putImageData(frame, 0, 0);
      }
      animId = requestAnimationFrame(processFrame);
    };

    const startLoop = () => {
      if (animId === null) {
        animId = requestAnimationFrame(processFrame);
      }
    };

    const stopLoop = () => {
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersecting = entry.isIntersecting;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            startLoop();
          } else {
            video.pause();
            stopLoop();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(container);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
        stopLoop();
      } else if (isIntersecting) {
        video.play().catch(() => {});
        startLoop();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      stopLoop();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div ref={containerRef} className={className} aria-hidden="true">
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="auto"
        style={{ display: "none" }}
      >
        <source
          src="/videos/Flower_blooming_animation_20260930153841_erasio.mp4"
          type="video/mp4"
        />
        <source
          src="/videos/Flower_blooming_animation_20260930153841_erasio.mov"
          type="video/quicktime"
        />
      </video>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          mixBlendMode: "multiply",
          filter: "drop-shadow(0 6px 16px rgba(180, 80, 90, 0.15))"
        }}
      />
    </div>
  );
}
