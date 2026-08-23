"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { deleteProduct, getProducts } from "@/services/productService";
import PageHeader from "@/components/ui/PageHeader";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Skeleton from "@/components/ui/Skeleton";
import ProductImage from "@/components/ui/ProductImage";
import {
  formatCurrency,
  matchesQuery,
  paginateItems,
  sortByKey,
} from "@/lib/utils";

const PAGE_SIZE = 8;

export default function ProductsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortKey, setSortKey] = useState("id");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (searchParams.get("created")) {
      setSuccess("Product created successfully.");
    } else if (searchParams.get("updated")) {
      setSuccess("Product updated successfully.");
    } else if (searchParams.get("deleted")) {
      setSuccess("Product deleted successfully.");
    }
  }, [searchParams]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getProducts();
        if (active) {
          setProducts(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load products.");
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
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category).filter(Boolean))),
    [products]
  );

  const filtered = useMemo(() => {
    const searched = products.filter((product) => {
      const matchesCategory = category === "all" || product.category === category;
      const matchesSearch = [product.title, product.category, product.description].some(
        (value) => matchesQuery(value, query)
      );
      return matchesCategory && matchesSearch;
    });
    return sortByKey(searched, sortKey, "asc");
  }, [products, query, category, sortKey]);

  const paginated = useMemo(
    () => paginateItems(filtered, page, PAGE_SIZE),
    [filtered, page]
  );

  useEffect(() => {
    setPage(1);
  }, [query, category, sortKey]);

  async function handleDelete() {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    setError("");
    try {
      await deleteProduct(pendingDelete.id);
      setProducts((current) =>
        current.filter((product) => product.id !== pendingDelete.id)
      );
      setSuccess(`Product #${pendingDelete.id} was deleted.`);
      setPendingDelete(null);
    } catch (err) {
      setError(err.message || "Unable to delete the product.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Browse, search, and manage catalog items."
        actionHref="/products/create"
        actionLabel="Create product"
      />

      {success ? <Alert tone="success" message={success} /> : null}
      {error ? <Alert tone="error" title="Products error" message={error} /> : null}

      <Card>
        <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-3">
          <Input
            id="product-search"
            placeholder="Search products by title, category, or description"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Select
            id="product-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select
            id="product-sort"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value)}
          >
            <option value="id">Sort by ID</option>
            <option value="title">Sort by title</option>
            <option value="price">Sort by price</option>
            <option value="category">Sort by category</option>
          </Select>
        </div>

        {loading ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-72" />
            ))}
          </div>
        ) : paginated.items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No products found"
              message="Try another search or add a new product to the catalog."
              actionLabel="Create product"
              onAction={() => router.push("/products/create")}
            />
          </div>
        ) : (
          <>
            <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
              {paginated.items.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="flex h-40 items-center justify-center bg-slate-50 p-4">
                    <ProductImage
                      src={product.image}
                      alt={product.title}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <Badge className="w-fit">{product.category}</Badge>
                    <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900">
                      {product.title}
                    </h3>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(product.price)}
                      </p>
                      <p className="inline-flex items-center gap-1 text-xs text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {product.rating?.rate || 0}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={`/products/${product.id}`}>
                        <Button size="sm" variant="secondary">View</Button>
                      </Link>
                      <Link href={`/products/${product.id}/edit`}>
                        <Button size="sm" variant="secondary">Edit</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setPendingDelete(product)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              page={paginated.page}
              totalPages={paginated.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete product"
        message={`Are you sure you want to delete ${pendingDelete?.title || "this product"}?`}
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
