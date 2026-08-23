import { Suspense } from "react";
import UsersView from "@/components/users/UsersView";
import Spinner from "@/components/ui/Spinner";

export default function UsersPage() {
  return (
    <Suspense fallback={<Spinner label="Loading users..." />}>
      <UsersView />
    </Suspense>
  );
}
