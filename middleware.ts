// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  // Get the cookie from the request
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If there's no token and the route is not public, redirect to login
  if (!token && !isPublicRoute) {
    const url = new URL('/login', request.url);
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  // If there's a token and the user is trying to access login page, redirect to home
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Otherwise, continue with the request
  return NextResponse.next();
}

// Specify which paths this middleware should run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};