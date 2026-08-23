import { requireApiAuth } from "@/lib/apiAuth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/errors";
import { fakestoreRequest, normalizeProduct } from "@/lib/fakestore";
import {
  isDeleted,
  resolveItem,
  saveDeleted,
  saveUpdated,
} from "@/lib/overlayStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validateProductPayload(body) {
  const details = [];
  const title = String(body?.title || "").trim();
  const price = Number(body?.price);
  const description = String(body?.description || "").trim();
  const category = String(body?.category || "").trim();
  const image = String(body?.image || "").trim();

  if (!title) {
    details.push("Title is required.");
  }
  if (!Number.isFinite(price) || price <= 0) {
    details.push("A valid price greater than 0 is required.");
  }
  if (!description) {
    details.push("Description is required.");
  }
  if (!category) {
    details.push("Category is required.");
  }
  if (!image) {
    details.push("Image URL is required.");
  }

  return details;
}

export async function GET(_request, { params }) {
  const { error } = await requireApiAuth();
  if (error) {
    return error;
  }

  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return jsonError(400, "A valid product id is required.");
  }

  if (isDeleted("products", numericId)) {
    return jsonError(404, "Product not found.");
  }

  const overlayProduct = resolveItem("products", numericId, null);
  if (overlayProduct) {
    return jsonOk(normalizeProduct(overlayProduct), "Product loaded successfully.");
  }

  const result = await fakestoreRequest(`/products/${numericId}`);

if (!result.ok) {
  const status = [400, 401, 403, 404, 500].includes(result.status)
    ? result.status
    : 500;

  return jsonError(
    status,
    status === 404
      ? "Product not found."
      : "Unable to load the product right now."
  );
}

if (!result.data || typeof result.data !== "object") {
  return jsonError(404, "Product not found.");
}

return jsonOk(
  normalizeProduct(result.data),
  "Product loaded successfully."
);
}

export async function PUT(request, { params }) {
  const { error } = await requireApiAuth();
  if (error) {
    return error;
  }

  try {
    const { id } = await params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return jsonError(400, "A valid product id is required.");
    }

    if (isDeleted("products", numericId)) {
      return jsonError(404, "Product not found.");
    }

    const { body, error: bodyError } = await readJsonBody(request);
    if (bodyError) {
      return bodyError;
    }
    const details = validateProductPayload(body);
    if (details.length) {
      return jsonError(400, "Please correct the highlighted fields.", details);
    }

    const payload = normalizeProduct({ ...body, id: numericId });
    const result = await fakestoreRequest(`/products/${numericId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (!result.ok && numericId < 10001) {
      const status = [400, 401, 403, 404, 500].includes(result.status)
        ? result.status
        : 500;
      return jsonError(status, "Unable to update the product.");
    }

    const updated = saveUpdated("products", numericId, payload, result.data || {});
    return jsonOk(normalizeProduct(updated), "Product updated successfully.");
  } catch {
    return jsonError(500, "Unable to update the product right now.");
  }
}

export async function DELETE(_request, { params }) {
  const { error } = await requireApiAuth();
  if (error) {
    return error;
  }

  try {
    const { id } = await params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return jsonError(400, "A valid product id is required.");
    }

    if (isDeleted("products", numericId)) {
      return jsonError(404, "Product not found.");
    }

    const result = await fakestoreRequest(`/products/${numericId}`, {
      method: "DELETE",
    });

    if (!result.ok && numericId < 10001) {
      const status = [400, 401, 403, 404, 500].includes(result.status)
        ? result.status
        : 500;
      return jsonError(status, "Unable to delete the product.");
    }

    const deleted = saveDeleted("products", numericId);
    return jsonOk(deleted, "Product deleted successfully.");
  } catch {
    return jsonError(500, "Unable to delete the product right now.");
  }
}
