import { NextRequest, NextResponse } from 'next/server';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const API_LIMIT_PER_WINDOW = 120;
const HEAVY_API_LIMIT_PER_WINDOW = 30;
const HEAVY_PATH_PREFIXES = [
  '/api/chat',
  '/api/tts',
  '/api/speech-to-text',
  '/api/assessment',
];

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}

function getLimit(pathname: string): number {
  return HEAVY_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    ? HEAVY_API_LIMIT_PER_WINDOW
    : API_LIMIT_PER_WINDOW;
}

function shouldBypass(pathname: string): boolean {
  return pathname === '/api/health';
}

function checkRateLimit(clientKey: string, limit: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(clientKey);

  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(clientKey, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfter: Math.ceil(WINDOW_MS / 1000) };
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  rateLimitStore.set(clientKey, entry);
  return { ok: true, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
}

function cleanupExpiredEntries() {
  const now = Date.now();
  if (rateLimitStore.size < 5_000) return;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldBypass(pathname)) {
    return NextResponse.next();
  }

  cleanupExpiredEntries();

  const clientIp = getClientIp(request);
  const limit = getLimit(pathname);
  const clientKey = `${clientIp}:${pathname}`;
  const result = checkRateLimit(clientKey, limit);

  if (!result.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please retry shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': result.retryAfter.toString(),
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
