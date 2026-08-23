import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { jsonOk, jsonError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const response = jsonOk({ loggedOut: true }, "Signed out successfully.");
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch {
    return jsonError(500, "Unable to complete logout right now.");
  }
}
