"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById, updateProduct } from "@/services/productService";
import ProductForm from "@/components/products/ProductForm";
import PageHeader from "@/components/ui/PageHeader";
import Alert from "@/components/ui/Alert";
import Skeleton from "@/components/ui/Skeleton";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getProductById(params.id);
        if (active) {
          setProduct(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load this product.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [params.id]);

  async function handleSubmit(values) {
    const updated = await updateProduct(params.id, values);
    router.push(`/products/${updated.id}?updated=1`);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !product) {
    return <Alert tone="error" title="Unable to edit product" message={error} />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Edit product"
        description="Update catalog details for this item."
      />
      <ProductForm
        initialValues={product}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
