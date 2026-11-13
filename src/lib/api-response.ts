import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiResponseSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiResponseError {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
}

export function successResponse<T>(
  data: T,
  message = "Operation completed successfully",
  status = 200
) {
  const body: ApiResponseSuccess<T> = {
    success: true,
    message,
    data,
  };
  return NextResponse.json(body, { status });
}

export function errorResponse(
  message = "An error occurred",
  code = "INTERNAL_SERVER_ERROR",
  status = 500,
  details?: unknown
) {
  const body: ApiResponseError = {
    success: false,
    message,
    error: {
      code,
      details,
    },
  };
  return NextResponse.json(body, { status });
}

export function handleApiError(error: unknown) {
  console.error("[API Error Handler]:", error);

  if (error instanceof ZodError) {
    return errorResponse(
      "Validation failed",
      "VALIDATION_ERROR",
      400,
      error.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
    );
  }

  if (error instanceof Error) {
    if (error.message.includes("E11000 duplicate key")) {
      return errorResponse("A record with that key already exists", "DUPLICATE_KEY_ERROR", 409);
    }
    return errorResponse(error.message, "APPLICATION_ERROR", 400);
  }

  return errorResponse("An unexpected server error occurred", "INTERNAL_SERVER_ERROR", 500);
}

