"use client";

import { useEffect, useMemo, useState } from "react";
import { FolderTree, Package, UserCheck, Users } from "lucide-react";
import { getProducts } from "@/services/productService";
import { getUsers } from "@/services/userService";
import KpiCard from "@/components/dashboard/KpiCard";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
import Skeleton from "@/components/ui/Skeleton";
import { formatCurrency, getUserFullName } from "@/lib/utils";

export default function DashboardView() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [productData, userData] = await Promise.all([
          getProducts(),
          getUsers(),
        ]);
        if (!active) return;
        setProducts(productData);
        setUsers(userData);
      } catch (err) {
        if (!active) return;
        setError(err.message || "Unable to load dashboard data.");
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
    () => new Set(products.map((product) => product.category).filter(Boolean)),
    [products]
  );
  const activeUsers = useMemo(
    () =>
      users.filter((user) => user.email && user.username && user.phone).length,
    [users]
  );
  const recentProducts = products.slice(0, 5);
  const recentUsers = users.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return <Alert tone="error" title="Dashboard unavailable" message={error} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of catalog and customer activity from Fake Store.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Products"
          value={products.length}
          hint="Items currently in the catalog"
          icon={Package}
          accent="bg-indigo-50 text-indigo-600"
        />
        <KpiCard
          title="Total Categories"
          value={categories.size}
          hint="Unique product categories"
          icon={FolderTree}
          accent="bg-amber-50 text-amber-600"
        />
        <KpiCard
          title="Total Users"
          value={users.length}
          hint="Registered store customers"
          icon={Users}
          accent="bg-sky-50 text-sky-600"
        />
        <KpiCard
          title="Active Users"
          value={activeUsers}
          hint="Users with complete contact details"
          icon={UserCheck}
          accent="bg-emerald-50 text-emerald-600"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-base font-semibold text-slate-900">Recent products</h2>
          <div className="mt-4 space-y-3">
            {recentProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {product.title}
                  </p>
                  <p className="text-xs capitalize text-slate-500">
                    {product.category}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(product.price)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-slate-900">Recent users</h2>
          <div className="mt-4 space-y-3">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {getUserFullName(user)}
                  </p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
                <p className="text-xs text-slate-500">#{user.id}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
