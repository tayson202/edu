// lib/api-response.ts
// Standard API Response Envelope per Enterprise Backend Architecture Blueprint

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
}

export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function apiError(
  message: string,
  status = 400,
  code = "BAD_REQUEST"
): Response {
  return Response.json(
    {
      success: false,
      error: message,
      code,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
