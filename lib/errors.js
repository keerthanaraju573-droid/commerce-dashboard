import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export const HTTP_MESSAGES = {
  200: "Request completed successfully.",
  201: "Resource created successfully.",
  400: "The request could not be processed. Please check the submitted information.",
  401: "You are not authorized. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource could not be found.",
  500: "An unexpected server error occurred. Please try again.",
};

export function getHttpMessage(status, fallback) {
  return fallback || HTTP_MESSAGES[status] || "Something went wrong. Please try again.";
}

export function jsonOk(data, message = HTTP_MESSAGES[200], status = 200) {
  return NextResponse.json(
    {
      success: true,
      status,
      message,
      data,
    },
    { status }
  );
}

export function jsonCreated(data, message = HTTP_MESSAGES[201]) {
  return jsonOk(data, message, 201);
}

export function jsonError(status, message, details = null) {
  return NextResponse.json(
    {
      success: false,
      status,
      error: {
        status,
        message: getHttpMessage(status, message),
        details,
      },
    },
    { status }
  );
}

export async function readJsonBody(request) {
  try {
    return { body: await request.json(), error: null };
  } catch {
    return {
      body: null,
      error: jsonError(400, "Request body must be valid JSON."),
    };
  }
}
