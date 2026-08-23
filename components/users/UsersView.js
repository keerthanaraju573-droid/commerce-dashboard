"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import { deleteUser, getUsers } from "@/services/userService";
import PageHeader from "@/components/ui/PageHeader";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Skeleton from "@/components/ui/Skeleton";
import {
  formatAddress,
  getUserFullName,
  matchesQuery,
  paginateItems,
  sortByKey,
} from "@/lib/utils";

const PAGE_SIZE = 5;

export default function UsersView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (searchParams.get("created")) {
      setSuccess("User created successfully.");
    } else if (searchParams.get("updated")) {
      setSuccess("User updated successfully.");
    } else if (searchParams.get("deleted")) {
      setSuccess("User deleted successfully.");
    }
  }, [searchParams]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getUsers();
        if (active) {
          setUsers(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load users.");
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

  const filtered = useMemo(() => {
    const searched = users.filter((user) => {
      const haystack = [
        user.id,
        getUserFullName(user),
        user.email,
        user.username,
        user.phone,
        formatAddress(user.address),
      ];
      return haystack.some((value) => matchesQuery(value, query));
    });
    return sortByKey(searched, sortKey, sortDirection);
  }, [users, query, sortKey, sortDirection]);

  const paginated = useMemo(
    () => paginateItems(filtered, page, PAGE_SIZE),
    [filtered, page]
  );

  useEffect(() => {
    setPage(1);
  }, [query, sortKey, sortDirection]);

  function toggleSort(nextKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortDirection("asc");
  }

  async function handleDelete() {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    setError("");
    try {
      await deleteUser(pendingDelete.id);
      setUsers((current) => current.filter((user) => user.id !== pendingDelete.id));
      setSuccess(`User #${pendingDelete.id} was deleted.`);
      setPendingDelete(null);
    } catch (err) {
      setError(err.message || "Unable to delete the user.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Search, sort, and manage store customers."
        actionHref="/users/create"
        actionLabel="Create user"
      />

      {success ? <Alert tone="success" message={success} /> : null}
      {error ? <Alert tone="error" title="Users error" message={error} /> : null}

      <Card>
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Input
              id="user-search"
              placeholder="Search by name, email, username, or phone"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Select
            id="user-sort"
            value={`${sortKey}:${sortDirection}`}
            onChange={(event) => {
              const [key, direction] = event.target.value.split(":");
              setSortKey(key);
              setSortDirection(direction);
            }}
          >
            <option value="id:asc">ID ascending</option>
            <option value="id:desc">ID descending</option>
            <option value="name:asc">Name A-Z</option>
            <option value="name:desc">Name Z-A</option>
            <option value="email:asc">Email A-Z</option>
            <option value="email:desc">Email Z-A</option>
            <option value="username:asc">Username A-Z</option>
            <option value="username:desc">Username Z-A</option>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14" />
            ))}
          </div>
        ) : paginated.items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No users found"
              message="Try a different search or create a new user."
              actionLabel="Create user"
              onAction={() => router.push("/users/create")}
            />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    {[
                      ["id", "ID"],
                      ["name", "Name"],
                      ["email", "Email"],
                      ["username", "Username"],
                    ].map(([key, label]) => (
                      <th key={key} className="px-4 py-3 font-medium">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-slate-900"
                          onClick={() => toggleSort(key)}
                        >
                          {label}
                          <ArrowUpDown className="h-3.5 w-3.5" />
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Address</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.items.map((user) => (
                    <tr key={user.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-slate-500">#{user.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {getUserFullName(user)}
                      </td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.username}</td>
                      <td className="px-4 py-3">{user.phone || "—"}</td>
                      <td className="max-w-xs truncate px-4 py-3 text-slate-500">
                        {formatAddress(user.address)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/users/${user.id}`} className="rounded-lg p-2 hover:bg-slate-100">
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link href={`/users/${user.id}/edit`} className="rounded-lg p-2 hover:bg-slate-100">
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                            onClick={() => setPendingDelete(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {paginated.items.map((user) => (
                <div key={user.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{getUserFullName(user)}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                    <p className="text-xs text-slate-400">#{user.id}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">@{user.username}</p>
                  <p className="mt-1 text-sm text-slate-500">{user.phone || "No phone"}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatAddress(user.address)}</p>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/users/${user.id}`}>
                      <Button size="sm" variant="secondary">View</Button>
                    </Link>
                    <Link href={`/users/${user.id}/edit`}>
                      <Button size="sm" variant="secondary">Edit</Button>
                    </Link>
                    <Button size="sm" variant="danger" onClick={() => setPendingDelete(user)}>
                      Delete
                    </Button>
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
        title="Delete user"
        message={`Are you sure you want to delete ${pendingDelete ? getUserFullName(pendingDelete) : "this user"}? This action cannot be undone.`}
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
