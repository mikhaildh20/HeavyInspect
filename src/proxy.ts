import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login');
  const isChangePasswordPage = req.nextUrl.pathname.startsWith('/change-password');
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin');
  const mustChangePassword = (req.auth?.user as unknown as Record<string, unknown>)?.mustChangePassword === true;
  const role = (req.auth?.user as unknown as Record<string, unknown>)?.role;

  if (isAuthPage) {
    if (isLoggedIn) {
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.nextUrl));
      }
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
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.nextUrl));
    }
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  if (role === 'admin' && !isAdminPage) {
    return NextResponse.redirect(new URL('/admin', req.nextUrl));
  }

  if (role !== 'admin' && isAdminPage) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico).*)'],
};
