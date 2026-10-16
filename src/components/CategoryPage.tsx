"use client";

import React, { useMemo, useState, useEffect } from "react";
import styles from "./CategoryPage.module.css";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Product } from "@/data/catalog";

const DEFAULT_FILTER_TABS = [
  { id: "all", label: "All Items" },
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "flowers-in-boxes", label: "Flowers in Boxes" },
  { id: "handcrafted-baskets", label: "Handcrafted Baskets" },
];

interface CategoryPageProps {
  title?: string;
  description?: string;
  products: Product[];
  filterTabs?: { id: string; label: string }[];
}

export default function CategoryPage({
  title = "Flower Baskets",
  description,
  products,
  filterTabs,
}: CategoryPageProps) {
  const tabs = filterTabs && filterTabs.length > 0 ? filterTabs : DEFAULT_FILTER_TABS;
  const [activeFilterId, setActiveFilterId] = useState<string>(tabs[0].id);

  // Sync tab with URL search parameter if present (e.g. /cakes?tab=chocolate)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        const found = tabs.find(
          (t) => t.id.toLowerCase() === tabParam.toLowerCase()
        );
        if (found) {
          setActiveFilterId(found.id);
        }
      }
    }
  }, [tabs]);

  const visibleProducts = useMemo(() => {
    if (activeFilterId === "all" || activeFilterId.toLowerCase() === "all items") {
      return products;
    }
    const f = activeFilterId.toLowerCase();
    return products.filter((p) => {
      const text = `${p.name} ${p.description ?? ""} ${p.slug ?? ""} ${p.badge ?? ""}`.toLowerCase();
      if (f === "birthday")
        return (
          text.includes("birthday") ||
          text.includes("celebration") ||
          text.includes("sunflower") ||
          text.includes("gerbera")
        );
      if (f === "anniversary")
        return (
          text.includes("anniversary") ||
          text.includes("wedding") ||
          text.includes("heart") ||
          text.includes("romance") ||
          text.includes("engaged")
        );
      if (f === "chocolate")
        return (
          text.includes("chocolate") ||
          text.includes("truffle") ||
          text.includes("fudge") ||
          text.includes("cocoa")
        );
      if (f === "fruit")
        return (
          text.includes("fruit") ||
          text.includes("berry") ||
          text.includes("berries") ||
          text.includes("strawberr") ||
          text.includes("blueberr") ||
          text.includes("vanilla")
        );
      if (f === "lilies") return text.includes("lil");
      if (f === "roses") return text.includes("rose");
      if (f === "bouquets") return text.includes("bouquet");
      if (f === "flowers-in-boxes" || f === "flowers in boxes")
        return (
          text.includes("basket") ||
          text.includes("box") ||
          text.includes("crate")
        );
      if (f === "handcrafted-baskets" || f === "handcrafted baskets")
        return text.includes("basket");
      if (f === "centerpiece")
        return text.includes("centerpiece") || text.includes("candelabra");
      if (f === "runner")
        return text.includes("runner") || text.includes("banquet");
      if (f === "wedding")
        return text.includes("wedding") || text.includes("ceremony") || text.includes("arch");
      if (f === "rustic")
        return text.includes("rustic") || text.includes("burlap") || text.includes("woven");
      if (f === "heart")
        return text.includes("heart");
      if (f === "cross")
        return text.includes("cross");
      if (f === "circular")
        return text.includes("circular") || text.includes("ring") || text.includes("laurel");
      if (f === "easel")
        return text.includes("easel") || text.includes("standing");
      return text.includes(f);
    });
  }, [activeFilterId, products]);

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <main className={styles.mainContent}>
        {/* ================= HEADING ================= */}
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{title}</h1>
          {description ? (
            <p className={styles.pageSubtitle} style={{ whiteSpace: "pre-line" }}>
              {description}
            </p>
          ) : (
            <p className={styles.pageSubtitle}>
              Artisanal hand-woven baskets brimming with
              <br />
              fresh roses, peonies, baby&apos;s breath &amp; fragrant greenery.
            </p>
          )}
        </header>

        {/* ================= PINK PANEL ================= */}
        <section className={styles.categoryPanel}>
          <div
            className={styles.filterTabsRow}
            role="tablist"
            aria-label="Filter products"
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeFilterId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.filterPill} ${
                    isActive ? styles.filterPillActive : ""
                  }`}
                  onClick={() => setActiveFilterId(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className={styles.gridContainer}>
            <div className={styles.productGrid}>
              {visibleProducts.length > 0 ? (
                visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <p className={styles.emptyState}>
                  No products in this category yet.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}