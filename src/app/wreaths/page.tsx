import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getProductsByCategory } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Wreaths | Occassions Florist Calicut",
  description:
    "Handcrafted tribute wreaths, standing easels & sacred cross floral tributes crafted with utmost grace & devotion.",
};

const WREATH_TABS = [
  { id: "all", label: "All Items" },
  { id: "cross", label: "Cross Wreaths" },
  { id: "circular", label: "Circular Rings" },
  { id: "easel", label: "Standing Easels" },
];

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams?: Promise<{
    tab?: string | string[];
    flower?: string | string[];
    type?: string | string[];
    category?: string | string[];
    search?: string | string[];
    q?: string | string[];
  }>;
}

export default async function WreathsCategoryPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const wreathProducts = getProductsByCategory("wreaths");

  const rawTabParam =
    resolvedParams?.tab ||
    resolvedParams?.flower ||
    resolvedParams?.type ||
    resolvedParams?.category;

  const tabParam = Array.isArray(rawTabParam) ? rawTabParam[0] : rawTabParam;

  let initialFilterId = "all";
  if (tabParam) {
    const raw = String(tabParam).toLowerCase().trim();
    const clean = raw.replace(/s$/, "").replace(/[-_]/g, " ");
    const found = WREATH_TABS.find(
      (t) =>
        t.id.toLowerCase() === raw ||
        t.id.toLowerCase().replace(/s$/, "") === clean ||
        t.label.toLowerCase() === raw ||
        t.label.toLowerCase().replace(/s$/, "") === clean ||
        clean.includes(t.id.toLowerCase()) ||
        raw.includes(t.id.toLowerCase())
    );
    if (found) initialFilterId = found.id;
  }

  const rawSearch = resolvedParams?.search || resolvedParams?.q;
  const initialSearch = Array.isArray(rawSearch) ? rawSearch[0] : rawSearch;

  return (
    <CategoryPage
      title="Wreaths"
      description={"Handcrafted tribute wreaths, standing easels & sacred cross tributes\ncrafted with utmost grace, reverence & care."}
      products={wreathProducts}
      filterTabs={WREATH_TABS}
      initialFilterId={initialFilterId}
      initialSearch={initialSearch}
    />
  );
}
