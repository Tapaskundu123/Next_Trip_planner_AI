import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public paths accessible without authentication (landing page, pricing, contact, etc.)
  const isPublicPath =
    path === '/' ||
    path === '/login' ||
    path === '/signup' ||
    path === '/pricing' ||
    path === '/contact-us' ||
    path === '/dashboard' ||
    path === '/create-new-trip';

  const token = request.cookies.get('token')?.value;

  // If logged in and trying to access login/signup, redirect to home page
  if (token && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If not logged in and trying to access protected routes (like /my-trips, /payment-success, /admin)
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/create-new-trip',
    '/dashboard',
    '/my-trips',
    '/payment-success',
    '/pricing',
    '/contact-us',
    '/admin',
  ],
};

// Next.js middleware export
export { proxy as middleware };

