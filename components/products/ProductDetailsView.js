"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { deleteProduct, getProductById } from "@/services/productService";
import { formatCurrency } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import Skeleton from "@/components/ui/Skeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ProductImage from "@/components/ui/ProductImage";

export default function ProductDetailsView() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
          setError(err.message || "Product not found.");
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

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteProduct(params.id);
      router.push("/products?deleted=1");
    } catch (err) {
      setError(err.message || "Unable to delete the product.");
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <Alert
          tone="error"
          title="Product not found"
          message={error || "This product does not exist."}
        />
        <Link href="/products">
          <Button variant="secondary">Back to products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Badge>{product.category}</Badge>
          <h1 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-slate-900">
            {product.title}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/products/${product.id}/edit`}>
            <Button>Edit product</Button>
          </Link>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Delete product
          </Button>
          <Link href="/products">
            <Button variant="secondary">Back to list</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="flex items-center justify-center bg-slate-50 p-6">
          <ProductImage
            src={product.image}
            alt={product.title}
            className="max-h-80 w-full object-contain"
          />
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-3xl font-semibold text-slate-900">
              {formatCurrency(product.price)}
            </p>
            <p className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
              <Star className="h-4 w-4 fill-current" />
              {product.rating?.rate || 0} ({product.rating?.count || 0} reviews)
            </p>
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-600">{product.description}</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Product ID</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">#{product.id}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Category</dt>
              <dd className="mt-1 text-sm font-medium capitalize text-slate-900">
                {product.category}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete product"
        message={`Delete ${product.title}? This cannot be undone.`}
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
