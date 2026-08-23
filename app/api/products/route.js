import { requireApiAuth } from "@/lib/apiAuth";
import { jsonCreated, jsonError, jsonOk, readJsonBody } from "@/lib/errors";
import { fakestoreRequest, normalizeProduct } from "@/lib/fakestore";
import { mergeCollection, saveCreated } from "@/lib/overlayStore";

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

export async function GET() {
  const { error } = await requireApiAuth();
  if (error) {
    return error;
  }

  const result = await fakestoreRequest("/products");
  if (!result.ok || !Array.isArray(result.data)) {
    const status = result.status === 404 ? 404 : 500;
    return jsonError(
      status,
      status === 404
        ? "Products were not found."
        : "Unable to load products from the catalog service."
    );
  }

  const products = mergeCollection(
    "products",
    result.data.map(normalizeProduct)
  ).map(normalizeProduct);

  return jsonOk(products, "Products loaded successfully.");
}

export async function POST(request) {
  const { error } = await requireApiAuth();
  if (error) {
    return error;
  }

  try {
    const { body, error: bodyError } = await readJsonBody(request);
    if (bodyError) {
      return bodyError;
    }
    const details = validateProductPayload(body);
    if (details.length) {
      return jsonError(400, "Please correct the highlighted fields.", details);
    }

    const payload = normalizeProduct(body);
    const result = await fakestoreRequest("/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!result.ok) {
      const status = [400, 401, 403, 404, 500].includes(result.status)
        ? result.status
        : 500;
      return jsonError(status, "Unable to create the product.");
    }

    const created = saveCreated("products", payload, result.data);
    return jsonCreated(normalizeProduct(created), "Product created successfully.");
  } catch {
    return jsonError(500, "Unable to create the product right now.");
  }
}
