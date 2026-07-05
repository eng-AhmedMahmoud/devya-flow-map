import { NextRequest, NextResponse } from 'next/server';

// Backend-session gate (mirrors admin-app). The whole system dashboard — the
// flow map AND the monitoring pages (users/deployments/activity) — sits behind
// an individual admin login. Role checks (e.g. Activity = SUPER_ADMIN) happen
// server-side inside the pages themselves.
const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password'];
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'devya_session';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) return NextResponse.next();
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) return NextResponse.next();

  const hasSession = Boolean(req.cookies.get(COOKIE_NAME)?.value);
  if (hasSession) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('from', pathname);
  return NextResponse.redirect(url);
}

// Exclude /api so the same-origin proxy + auth route handlers run un-gated
// (the backend enforces auth on API calls).
export const config = { matcher: ['/((?!api|_next|favicon|.*\\..*).*)'] };
