import { requireApiAuth } from "@/lib/apiAuth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/errors";
import { fakestoreRequest, normalizeUser } from "@/lib/fakestore";
import {
  isDeleted,
  resolveItem,
  saveDeleted,
  saveUpdated,
} from "@/lib/overlayStore";
import { isValidEmail } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validateUserPayload(body) {
  const details = [];
  const email = String(body?.email || "").trim();
  const username = String(body?.username || "").trim();
  const firstname = String(body?.name?.firstname || "").trim();
  const lastname = String(body?.name?.lastname || "").trim();

  if (!email || !isValidEmail(email)) {
    details.push("A valid email is required.");
  }
  if (!username) {
    details.push("Username is required.");
  }
  if (!firstname) {
    details.push("First name is required.");
  }
  if (!lastname) {
    details.push("Last name is required.");
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
    return jsonError(400, "A valid user id is required.");
  }

  if (isDeleted("users", numericId)) {
    return jsonError(404, "User not found.");
  }

  const overlayUser = resolveItem("users", numericId, null);
  if (overlayUser) {
    return jsonOk(normalizeUser(overlayUser), "User loaded successfully.");
  }

  const result = await fakestoreRequest(`/users/${numericId}`);

if (!result.ok) {
  const status = [400, 401, 403, 404, 500].includes(result.status)
    ? result.status
    : 500;

  return jsonError(
    status,
    status === 404
      ? "User not found."
      : "Unable to load the user right now."
  );
}

if (!result.data || typeof result.data !== "object") {
  return jsonError(404, "User not found.");
}

return jsonOk(normalizeUser(result.data), "User loaded successfully.");
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
      return jsonError(400, "A valid user id is required.");
    }

    if (isDeleted("users", numericId)) {
      return jsonError(404, "User not found.");
    }

    const { body, error: bodyError } = await readJsonBody(request);
    if (bodyError) {
      return bodyError;
    }
    const details = validateUserPayload(body);
    if (details.length) {
      return jsonError(400, "Please correct the highlighted fields.", details);
    }

    const payload = normalizeUser({ ...body, id: numericId });
    const result = await fakestoreRequest(`/users/${numericId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (!result.ok && numericId < 10001) {
      const status = [400, 401, 403, 404, 500].includes(result.status)
        ? result.status
        : 500;
      return jsonError(status, "Unable to update the user.");
    }

    const updated = saveUpdated("users", numericId, payload, result.data || {});
    return jsonOk(normalizeUser(updated), "User updated successfully.");
  } catch {
    return jsonError(500, "Unable to update the user right now.");
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
      return jsonError(400, "A valid user id is required.");
    }

    if (isDeleted("users", numericId)) {
      return jsonError(404, "User not found.");
    }

    const result = await fakestoreRequest(`/users/${numericId}`, {
      method: "DELETE",
    });

    if (!result.ok && numericId < 10001) {
      const status = [400, 401, 403, 404, 500].includes(result.status)
        ? result.status
        : 500;
      return jsonError(status, "Unable to delete the user.");
    }

    const deleted = saveDeleted("users", numericId);
    return jsonOk(deleted, "User deleted successfully.");
  } catch {
    return jsonError(500, "Unable to delete the user right now.");
  }
}
