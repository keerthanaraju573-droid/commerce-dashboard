"use client";

import { useRouter } from "next/navigation";
import { createProduct } from "@/services/productService";
import ProductForm from "@/components/products/ProductForm";
import PageHeader from "@/components/ui/PageHeader";

export default function CreateProductPage() {
  const router = useRouter();

  async function handleSubmit(values) {
    const created = await createProduct(values);
    router.push(`/products/${created.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Create product"
        description="Add a catalog item through the internal API."
      />
      <ProductForm submitLabel="Create product" onSubmit={handleSubmit} />
    </div>
  );
}
