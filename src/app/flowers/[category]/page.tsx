import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import FlowerCategoryPage from "@/components/flowers/FlowerCategoryPage";
import { getCategoryInfo, getProductsByCategory, CATEGORIES_DATA } from "@/data/flowerProducts";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  if (category === "bouquets") {
    return {
      title: "Flower Bouquets | Occassions Florist Calicut",
      description: "Handcrafted fresh floral bouquets featuring premium Dutch roses, lilies, tulips & seasonal blooms.",
    };
  }
  if (category === "baskets" || category === "flower-baskets") {
    return {
      title: "Flower Baskets | Occassions Florist Calicut",
      description: "Artisanal hand-woven baskets brimming with fresh roses, peonies, baby's breath & fragrant greenery.",
    };
  }
  const info = getCategoryInfo(category);
  return {
    title: `${info.name} Collection | Occasions Flower Shop Calicut`,
    description: info.description,
    openGraph: {
      title: `${info.title} - Occasions Flowers`,
      description: info.headline,
      images: info.heroImage ? [{ url: info.heroImage }] : undefined,
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(CATEGORIES_DATA).map((slug) => ({
    category: slug,
  }));
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;

  if (category === "bouquets") {
    redirect("/flower-bouquets");
  }
  if (category === "baskets" || category === "flower-baskets") {
    redirect("/flower-baskets");
  }

  const info = getCategoryInfo(category);
  const products = getProductsByCategory(category);

  return <FlowerCategoryPage category={info} products={products} />;
}
