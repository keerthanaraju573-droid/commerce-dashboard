"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserById, updateUser } from "@/services/userService";
import UserForm from "@/components/users/UserForm";
import PageHeader from "@/components/ui/PageHeader";
import Alert from "@/components/ui/Alert";
import Skeleton from "@/components/ui/Skeleton";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setError(err.message || "Unable to load this user.");
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
    const updated = await updateUser(params.id, values);
    router.push(`/users/${updated.id}?updated=1`);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !user) {
    return <Alert tone="error" title="Unable to edit user" message={error} />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Edit user"
        description={`Update profile details for ${user.username}.`}
      />
      <UserForm
        isEdit
        initialValues={user}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
