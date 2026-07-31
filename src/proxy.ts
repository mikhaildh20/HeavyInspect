import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login');
  const isChangePasswordPage = req.nextUrl.pathname.startsWith('/change-password');
  const mustChangePassword = (req.auth?.user as unknown as Record<string, unknown>)?.mustChangePassword === true;

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, req.nextUrl));
  }

  if (mustChangePassword && !isChangePasswordPage) {
    return NextResponse.redirect(new URL('/change-password', req.nextUrl));
  }

  if (!mustChangePassword && isChangePasswordPage) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico).*)'],
};
