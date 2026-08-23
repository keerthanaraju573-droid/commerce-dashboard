"use client";

import { useRouter } from "next/navigation";
import { createUser } from "@/services/userService";
import UserForm from "@/components/users/UserForm";
import PageHeader from "@/components/ui/PageHeader";

export default function CreateUserPage() {
  const router = useRouter();

  async function handleSubmit(values) {
    const created = await createUser(values);
    router.push(`/users/${created.id}`);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Create user"
        description="Add a customer profile through the internal API."
      />
      <UserForm submitLabel="Create user" onSubmit={handleSubmit} />
    </div>
  );
}
