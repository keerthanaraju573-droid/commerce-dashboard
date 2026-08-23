export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function getUserFullName(user) {
  const firstName = user?.name?.firstname || "";
  const lastName = user?.name?.lastname || "";
  return `${firstName} ${lastName}`.trim() || user?.username || "Unknown user";
}

export function formatAddress(address) {
  if (!address) {
    return "No address provided";
  }

  const parts = [
    address.number,
    address.street,
    address.city,
    address.zipcode,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "No address provided";
}

export function formatCurrency(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return "$0.00";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function paginateItems(items, page, pageSize) {
  const currentPage = Math.max(1, Number(page) || 1);
  const size = Math.max(1, Number(pageSize) || 8);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * size;

  return {
    items: items.slice(start, start + size),
    page: safePage,
    pageSize: size,
    totalItems,
    totalPages,
  };
}

export function sortByKey(items, key, direction = "asc") {
  const sorted = [...items].sort((a, b) => {
    const aValue = getSortValue(a, key);
    const bValue = getSortValue(b, key);

    if (typeof aValue === "number" && typeof bValue === "number") {
      return aValue - bValue;
    }

    return String(aValue).localeCompare(String(bValue), undefined, {
      sensitivity: "base",
      numeric: true,
    });
  });

  return direction === "desc" ? sorted.reverse() : sorted;
}

function getSortValue(item, key) {
  if (key === "name") {
    return getUserFullName(item).toLowerCase();
  }
  if (key === "email") {
    return item.email || "";
  }
  if (key === "username") {
    return item.username || "";
  }
  if (key === "title") {
    return item.title || "";
  }
  if (key === "price") {
    return Number(item.price) || 0;
  }
  if (key === "category") {
    return item.category || "";
  }
  return Number(item.id) || 0;
}

export function matchesQuery(value, query) {
  return String(value || "")
    .toLowerCase()
    .includes(String(query || "").trim().toLowerCase());
}
