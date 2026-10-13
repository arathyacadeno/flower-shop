import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getProductsByCategory } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Table Decor | Occassions Florist Calicut",
  description:
    "Stunning floral centerpieces, banquet runners & bespoke table arrangements handcrafted for memorable celebrations.",
};

const TABLE_DECOR_TABS = [
  { id: "all", label: "All Items" },
  { id: "centerpiece", label: "Centerpieces" },
  { id: "runner", label: "Runners & Banquets" },
  { id: "wedding", label: "Wedding & Ceremonies" },
  { id: "rustic", label: "Rustic & Casual" },
];

export default function TableDecorCategoryPage() {
  const tableProducts = getProductsByCategory("table-decor");

  return (
    <CategoryPage
      title="Table Decor"
      description={"Stunning floral centerpieces, banquet runners & bespoke table arrangements\nhandcrafted for memorable celebrations."}
      products={tableProducts}
      filterTabs={TABLE_DECOR_TABS}
    />
  );
}
