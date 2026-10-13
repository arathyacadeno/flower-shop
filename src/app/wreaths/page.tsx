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
  { id: "heart", label: "Heart Tributes" },
  { id: "cross", label: "Cross Wreaths" },
  { id: "circular", label: "Circular Rings" },
  { id: "easel", label: "Standing Easels" },
];

export default function WreathsCategoryPage() {
  const wreathProducts = getProductsByCategory("wreaths");

  return (
    <CategoryPage
      title="Wreaths"
      description={"Handcrafted tribute wreaths, standing easels & sacred cross tributes\ncrafted with utmost grace, reverence & care."}
      products={wreathProducts}
      filterTabs={WREATH_TABS}
    />
  );
}
