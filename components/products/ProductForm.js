"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";

const DEFAULT_CATEGORIES = [
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing",
];

const emptyProduct = {
  title: "",
  price: "",
  description: "",
  category: "electronics",
  image: "",
};

export default function ProductForm({
  initialValues,
  submitLabel,
  onSubmit,
}) {
  const router = useRouter();
  const [form, setForm] = useState({ ...emptyProduct, ...initialValues });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const values = useMemo(() => ({ ...emptyProduct, ...form }), [form]);
  const categories = DEFAULT_CATEGORIES.includes(values.category)
    ? DEFAULT_CATEGORIES
    : [values.category, ...DEFAULT_CATEGORIES];

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    const nextErrors = {};
    if (!String(values.title).trim()) {
      nextErrors.title = "Title is required.";
    }
    if (!values.price || Number(values.price) <= 0) {
      nextErrors.price = "Enter a price greater than 0.";
    }
    if (!String(values.description).trim()) {
      nextErrors.description = "Description is required.";
    }
    if (!String(values.category).trim()) {
      nextErrors.category = "Category is required.";
    }
    if (!String(values.image).trim()) {
      nextErrors.image = "Image URL is required.";
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
      await onSubmit({
        ...values,
        price: Number(values.price),
      });
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
          <Alert tone="error" title="Unable to save product" message={serverError} />
        ) : null}

        <Input
          id="title"
          label="Title"
          value={values.title}
          error={errors.title}
          onChange={(event) => updateField("title", event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            label="Price"
            value={values.price}
            error={errors.price}
            onChange={(event) => updateField("price", event.target.value)}
          />
          <Select
            id="category"
            label="Category"
            value={values.category}
            error={errors.category}
            onChange={(event) => updateField("category", event.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>

        <Input
          id="image"
          label="Image URL"
          value={values.image}
          error={errors.image}
          placeholder="https://..."
          onChange={(event) => updateField("image", event.target.value)}
        />

        <Textarea
          id="description"
          label="Description"
          value={values.description}
          error={errors.description}
          onChange={(event) => updateField("description", event.target.value)}
        />

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
