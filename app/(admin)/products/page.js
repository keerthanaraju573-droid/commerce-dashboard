import { Suspense } from "react";
import ProductsView from "@/components/products/ProductsView";
import Spinner from "@/components/ui/Spinner";

export default function ProductsPage() {
  return (
    <Suspense fallback={<Spinner label="Loading products..." />}>
      <ProductsView />
    </Suspense>
  );
}
