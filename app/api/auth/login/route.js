import {
  ADMIN_CREDENTIALS,
  AUTH_COOKIE_NAME,
  createAuthToken,
  getAuthCookieOptions,
} from "@/lib/auth";
import { jsonCreated, jsonError, readJsonBody } from "@/lib/errors";
import { isValidEmail } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { body, error } = await readJsonBody(request);
    if (error) {
      return error;
    }
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return jsonError(400, "Email and password are required.");
    }

    if (!isValidEmail(email)) {
      return jsonError(400, "Please enter a valid email address.");
    }

    const isValid =
      email === ADMIN_CREDENTIALS.email &&
      password === ADMIN_CREDENTIALS.password;

    if (!isValid) {
      return jsonError(401, "Invalid email or password.");
    }

    const token = await createAuthToken({
      email: ADMIN_CREDENTIALS.email,
      role: "admin",
    });

    const response = jsonCreated(
      {
        email: ADMIN_CREDENTIALS.email,
        role: "admin",
      },
      "Signed in successfully."
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
    return response;
  } catch {
    return jsonError(500, "Unable to complete login right now.");
  }
}
