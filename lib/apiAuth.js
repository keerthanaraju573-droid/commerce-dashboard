import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { jsonError } from "@/lib/errors";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifyAuthToken(token);
}

export async function requireApiAuth() {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      error: jsonError(401, "Authentication is required to access this resource."),
    };
  }

  if (session.role !== "admin") {
    return {
      session: null,
      error: jsonError(403, "Admin access is required for this action."),
    };
  }

  return { session, error: null };
}
