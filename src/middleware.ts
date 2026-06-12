import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const pathname      = req.nextUrl.pathname;
  const isAuthPage    = pathname.startsWith('/login');
  const isPublicApi   = pathname.startsWith('/api/auth')
                     || pathname.startsWith('/api/seed')
                     || pathname.startsWith('/api/cron');

  if (isPublicApi) return NextResponse.next();

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};