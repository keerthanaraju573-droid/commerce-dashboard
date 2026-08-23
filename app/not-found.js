import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-indigo-600">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The page you requested does not exist or is no longer available.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/dashboard">
            <Button>Go to dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
