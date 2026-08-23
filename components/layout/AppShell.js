"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const titles = {
  "/dashboard": "Dashboard",
  "/users": "Users",
  "/products": "Products",
};

function getTitle(pathname) {
  if (pathname.startsWith("/users/create")) return "Create user";
  if (pathname.includes("/users/") && pathname.endsWith("/edit")) return "Edit user";
  if (pathname.startsWith("/users/")) return "User details";
  if (pathname.startsWith("/products/create")) return "Create product";
  if (pathname.includes("/products/") && pathname.endsWith("/edit")) return "Edit product";
  if (pathname.startsWith("/products/")) return "Product details";
  return titles[pathname] || "Admin";
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header title={getTitle(pathname)} onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
