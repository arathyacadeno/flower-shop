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

  // Sync tab with URL search parameter if present (e.g. /flower-bouquets?tab=roses or ?flower=roses)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkParams = () => {
        const params = new URLSearchParams(window.location.search);
        const tabParam =
          params.get("tab") ||
          params.get("flower") ||
          params.get("type") ||
          params.get("category");
        if (tabParam) {
          const cleanParam = tabParam.toLowerCase().trim().replace(/s$/, "");
          const found = tabs.find(
            (t) =>
              t.id.toLowerCase() === tabParam.toLowerCase() ||
              t.id.toLowerCase().replace(/s$/, "") === cleanParam ||
              t.label.toLowerCase() === tabParam.toLowerCase() ||
              t.label.toLowerCase().replace(/s$/, "") === cleanParam
          );
          if (found) {
            setActiveFilterId(found.id);
          }
        }
      };

      checkParams();
      window.addEventListener("popstate", checkParams);
      return () => window.removeEventListener("popstate", checkParams);
    }
  }, [tabs]);

  const handleTabClick = (tabId: string) => {
    setActiveFilterId(tabId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tabId === "all") {
        url.searchParams.delete("tab");
        url.searchParams.delete("flower");
      } else {
        url.searchParams.set("tab", tabId);
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

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
      if (f === "roses" || f === "rose") return text.includes("rose");
      if (f === "orchids" || f === "orchid") return text.includes("orchid");
      if (f === "lilies" || f === "lily") return text.includes("lil");
      if (f === "carnations" || f === "carnation") return text.includes("carnation");
      if (f === "tulips" || f === "tulip" || f === "pastel-tulips") return text.includes("tulip");
      if (f === "sunflowers" || f === "sunflower") return text.includes("sunflower");
      if (f === "gerberas" || f === "gerbera") return text.includes("gerbera");
      if (f === "peonies" || f === "peony") return text.includes("peon");
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
                  onClick={() => handleTabClick(tab.id)}
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