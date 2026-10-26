"use client";

import React from "react";
import styles from "@/styles/image.module.css";

export type ImageAspectRatio =
  | "card"
  | "gallery"
  | "thumb"
  | "square"
  | "category"
  | "none";

export interface ProductImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: ImageAspectRatio;
  wrapperClassName?: string;
  imageClassName?: string;
  bg?: string;
  children?: React.ReactNode;
}

/**
 * Reusable ProductImage component
 * Enforces un-cropped object-fit: contain with consistent aspect-ratio and soft background.
 */
export default function ProductImage({
  src,
  alt,
  aspectRatio = "card",
  wrapperClassName = "",
  imageClassName = "",
  className = "",
  style,
  bg,
  children,
  ...imgProps
}: ProductImageProps) {
  const ratioClass =
    aspectRatio === "card"
      ? styles.ratioCard
      : aspectRatio === "gallery"
      ? styles.ratioGallery
      : aspectRatio === "thumb"
      ? styles.ratioThumbnail
      : aspectRatio === "square"
      ? styles.ratioSquare
      : aspectRatio === "category"
      ? styles.ratioCategory
      : "";

  const wrapperStyle = bg
    ? ({ "--img-bg": bg } as React.CSSProperties)
    : undefined;

  const combinedImgClass = `${styles.image} ${imageClassName} ${className}`.trim();

  // If the parent container already provides framing and aspect-ratio (e.g. aspectRatio="none")
  if (aspectRatio === "none") {
    return (
      <img
        src={src}
        alt={alt}
        className={combinedImgClass}
        style={style}
        {...imgProps}
      />
    );
  }

  return (
    <div
      className={`${styles.wrapper} ${ratioClass} ${wrapperClassName}`.trim()}
      style={wrapperStyle}
    >
      <img
        src={src}
        alt={alt}
        className={combinedImgClass}
        style={style}
        {...imgProps}
      />
      {children}
    </div>
  );
}
