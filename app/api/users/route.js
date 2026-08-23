import { requireApiAuth } from "@/lib/apiAuth";
import { jsonCreated, jsonError, jsonOk, readJsonBody } from "@/lib/errors";
import { fakestoreRequest, normalizeUser } from "@/lib/fakestore";
import { mergeCollection, saveCreated } from "@/lib/overlayStore";
import { isValidEmail } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validateUserPayload(body, { requirePassword }) {
  const details = [];
  const email = String(body?.email || "").trim();
  const username = String(body?.username || "").trim();
  const firstname = String(body?.name?.firstname || "").trim();
  const lastname = String(body?.name?.lastname || "").trim();
  const password = String(body?.password || "");

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
  if (requirePassword && !password) {
    details.push("Password is required.");
  }

  return details;
}

export async function GET() {
  const { error } = await requireApiAuth();
  if (error) {
    return error;
  }

  const result = await fakestoreRequest("/users");
  if (!result.ok || !Array.isArray(result.data)) {
    const status = result.status === 404 ? 404 : 500;
    return jsonError(
      status,
      status === 404 ? "Users were not found." : "Unable to load users from the catalog service."
    );
  }

  const users = mergeCollection("users", result.data.map(normalizeUser)).map(normalizeUser);
  return jsonOk(users, "Users loaded successfully.");
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
    const details = validateUserPayload(body, { requirePassword: true });
    if (details.length) {
      return jsonError(400, "Please correct the highlighted fields.", details);
    }

    const payload = normalizeUser(body);
    const result = await fakestoreRequest("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!result.ok) {
      const status = [400, 401, 403, 404, 500].includes(result.status)
        ? result.status
        : 500;
      return jsonError(status, "Unable to create the user.");
    }

    const created = saveCreated("users", payload, result.data);
    return jsonCreated(normalizeUser(created), "User created successfully.");
  } catch {
    return jsonError(500, "Unable to create the user right now.");
  }
}
