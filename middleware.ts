import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map<string, number[]>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 30;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return true;
  rateLimitMap.set(ip, [...recent, now]);
  return false;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for may contain a comma-separated list; the first is the client IP
    return forwarded.split(",")[0].trim();
  }
  // request.ip is available in some Next.js/Edge environments but not typed in all versions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (request as any).ip ?? "unknown";
}

export function middleware(request: NextRequest): NextResponse {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte warte kurz." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/calculate", "/api/curve", "/api/simulate"],
};
