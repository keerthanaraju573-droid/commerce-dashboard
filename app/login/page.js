"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { login } from "@/services/authService";
import { isValidEmail } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

const DEMO_EMAIL = "admin@example.com";
const DEMO_PASSWORD = "admin123";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const nextErrors = {};
    if (!email || !isValidEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!password) {
      nextErrors.password = "Password is required.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setServerError(err.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div className="hidden text-white lg:block">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-sm font-semibold">ShopAdmin</span>
          </div>
          <h1 className="mt-8 max-w-lg text-4xl font-semibold leading-tight">
            Manage your store catalog and customers from one dashboard.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            A Next.js admin console with protected routes, Axios services, and
            Fake Store API integration.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          <div className="mb-6 lg:hidden">
            <div className="inline-flex items-center gap-2 text-slate-900">
              <ShoppingBag className="h-5 w-5 text-indigo-600" />
              <span className="font-semibold">ShopAdmin</span>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Admin sign in</h2>
          <p className="mt-1 text-sm text-slate-500">
            Use the assessment credentials to continue.
          </p>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p><span className="font-medium">Email:</span> {DEMO_EMAIL}</p>
            <p className="mt-1"><span className="font-medium">Password:</span> {DEMO_PASSWORD}</p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {serverError ? (
              <Alert tone="error" title="Sign in failed" message={serverError} />
            ) : null}
            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              error={errors.email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
            />
            <Input
              id="password"
              type="password"
              label="Password"
              value={password}
              error={errors.password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              className="w-full"
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
