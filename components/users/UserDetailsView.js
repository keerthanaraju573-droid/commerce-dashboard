"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { deleteUser, getUserById } from "@/services/userService";
import { formatAddress, getUserFullName } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Skeleton from "@/components/ui/Skeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/ui/PageHeader";

export default function UserDetailsView() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
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
        const data = await getUserById(params.id);
        if (active) {
          setUser(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "User not found.");
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
      await deleteUser(params.id);
      router.push("/users?deleted=1");
    } catch (err) {
      setError(err.message || "Unable to delete the user.");
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <Alert tone="error" title="User not found" message={error || "This user does not exist."} />
        <Link href="/users">
          <Button variant="secondary">Back to users</Button>
        </Link>
      </div>
    );
  }

  const details = [
    ["ID", `#${user.id}`],
    ["Full name", getUserFullName(user)],
    ["Email", user.email],
    ["Username", user.username],
    ["Phone", user.phone || "Not provided"],
    ["Street", user.address?.street || "Not provided"],
    ["Number", user.address?.number || "Not provided"],
    ["City", user.address?.city || "Not provided"],
    ["Zip code", user.address?.zipcode || "Not provided"],
    ["Address", formatAddress(user.address)],
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={getUserFullName(user)}
        description="Complete customer profile"
      />

      <div className="flex flex-wrap gap-3">
        <Link href={`/users/${user.id}/edit`}>
          <Button>Edit user</Button>
        </Link>
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          Delete user
        </Button>
        <Link href="/users">
          <Button variant="secondary">Back to list</Button>
        </Link>
      </div>

      <Card className="p-5 sm:p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete user"
        message={`Delete ${getUserFullName(user)}? This cannot be undone.`}
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
