import { error, json } from "./validators";

export { error, json };

export interface ParsedBody<T> {
  success: true;
  data: T;
}

export interface ParseFailure {
  success: false;
  errorResponse: ReturnType<typeof error>;
}

export async function parseJsonBody<T>(
  context: { request: Request },
  validator: (body: unknown) => T | null,
  errorMessage: string
): Promise<ParsedBody<T> | ParseFailure> {
  let body: unknown;

  try {
    body = await context.request.json();
  } catch {
    return {
      success: false,
      errorResponse: error("Invalid JSON body.", 400)
    };
  }

  const parsed = validator(body);
  if (!parsed) {
    return {
      success: false,
      errorResponse: error(errorMessage, 400)
    };
  }

  return { success: true, data: parsed };
}

export function createMethodNotAllowedResponse(): ReturnType<typeof error> {
  return error("Method not allowed.", 405);
}

export function createParseErrorResponse(message: string): ReturnType<typeof error> {
  return error(message, 400);
}
