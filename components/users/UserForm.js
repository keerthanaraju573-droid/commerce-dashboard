"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isValidEmail } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";

const emptyUser = {
  email: "",
  username: "",
  password: "",
  phone: "",
  name: {
    firstname: "",
    lastname: "",
  },
  address: {
    city: "",
    street: "",
    number: "",
    zipcode: "",
  },
};

export default function UserForm({
  initialValues,
  submitLabel,
  onSubmit,
  isEdit = false,
}) {
  const router = useRouter();
  const [form, setForm] = useState({ ...emptyUser, ...initialValues });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const values = useMemo(
    () => ({
      ...emptyUser,
      ...form,
      name: { ...emptyUser.name, ...(form.name || {}) },
      address: { ...emptyUser.address, ...(form.address || {}) },
    }),
    [form]
  );

  function updateField(path, value) {
    setForm((current) => {
      if (path.startsWith("name.")) {
        return {
          ...current,
          name: { ...current.name, [path.replace("name.", "")]: value },
        };
      }
      if (path.startsWith("address.")) {
        return {
          ...current,
          address: {
            ...current.address,
            [path.replace("address.", "")]: value,
          },
        };
      }
      return { ...current, [path]: value };
    });
  }

  function validate() {
    const nextErrors = {};
    if (!values.email || !isValidEmail(values.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!values.username.trim()) {
      nextErrors.username = "Username is required.";
    }
    if (!isEdit && !values.password) {
      nextErrors.password = "Password is required.";
    }
    if (!values.name.firstname.trim()) {
      nextErrors.firstname = "First name is required.";
    }
    if (!values.name.lastname.trim()) {
      nextErrors.lastname = "Last name is required.";
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
      await onSubmit(values);
    } catch (err) {
      const details = Array.isArray(err.details) ? err.details.join(" ") : "";
      setServerError(details ? `${err.message} ${details}` : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {serverError ? (
          <Alert tone="error" title="Unable to save user" message={serverError} />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="firstname"
            label="First name"
            value={values.name.firstname}
            error={errors.firstname}
            onChange={(event) => updateField("name.firstname", event.target.value)}
          />
          <Input
            id="lastname"
            label="Last name"
            value={values.name.lastname}
            error={errors.lastname}
            onChange={(event) => updateField("name.lastname", event.target.value)}
          />
          <Input
            id="email"
            type="email"
            label="Email"
            value={values.email}
            error={errors.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
          <Input
            id="username"
            label="Username"
            value={values.username}
            error={errors.username}
            onChange={(event) => updateField("username", event.target.value)}
          />
          <Input
            id="password"
            type="password"
            label={isEdit ? "Password (optional)" : "Password"}
            value={values.password}
            error={errors.password}
            onChange={(event) => updateField("password", event.target.value)}
          />
          <Input
            id="phone"
            label="Phone"
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="street"
            label="Street"
            value={values.address.street}
            onChange={(event) => updateField("address.street", event.target.value)}
          />
          <Input
            id="number"
            label="Number"
            value={values.address.number}
            onChange={(event) => updateField("address.number", event.target.value)}
          />
          <Input
            id="city"
            label="City"
            value={values.address.city}
            onChange={(event) => updateField("address.city", event.target.value)}
          />
          <Input
            id="zipcode"
            label="Zip code"
            value={values.address.zipcode}
            onChange={(event) => updateField("address.zipcode", event.target.value)}
          />
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => router.back()} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} disabled={submitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
