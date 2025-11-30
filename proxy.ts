
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublicPath = path === '/login' || path === '/signup';

  const token = request.cookies.get('token')?.value;

  // If logged in and trying to access login/signup
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If not logged in and trying to access protected routes
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/', '/login', '/signup']
};

// 👇 This is the key line
export { proxy as middleware };
