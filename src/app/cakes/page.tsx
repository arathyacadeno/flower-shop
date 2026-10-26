import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getProductsByCategory } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Cakes | AVELISSE Florist Calicut",
  description: "Deliciously crafted cakes made to make every celebration sweeter.",
};

const CAKE_TABS = [
  { id: "all", label: "All Items" },
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "chocolate", label: "Chocolate Cakes" },
];

export default function CakesCategoryPage() {
  const cakeProducts = getProductsByCategory("cakes").filter(
    (p) => !p.id.startsWith("addon-")
  );

  return (
    <CategoryPage
      title="Cakes"
      description="Deliciously crafted cakes made to make every celebration sweeter."
      products={cakeProducts}
      filterTabs={CAKE_TABS}
    />
  );
}
