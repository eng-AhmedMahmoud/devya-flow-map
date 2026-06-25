import { NextResponse } from 'next/server';

const COOKIE_NAME = 'devya_flowmap_auth';
const MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(req: Request) {
  let password = '';
  try {
    const body = await req.json();
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
  }

  const expectedPassword = process.env.SITE_PASSWORD;
  const token = process.env.SITE_AUTH_TOKEN;

  if (!expectedPassword || !token) {
    return NextResponse.json(
      { ok: false, error: 'Server not configured. Set SITE_PASSWORD and SITE_AUTH_TOKEN.' },
      { status: 500 },
    );
  }

  if (password !== expectedPassword) {
    return NextResponse.json({ ok: false, error: 'Wrong password.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
  return res;
}
