import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicPaths = ['/', '/login', '/api/auth/'];
  
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const token = await getToken({ req: request });
  
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Check if user has admin role for admin-only routes
  const adminOnlyPaths = [
    '/dashboard',
    '/api/v1/promo-codes',
    '/api/v1/agencies',
    '/api/v1/reports'
  ];

  const isAdminOnlyRoute = adminOnlyPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAdminOnlyRoute && token.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized: Admin access required' },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

// Configuration for which routes to apply middleware to
export const config = {
  matcher: ['/dashboard/:path*', '/api/v1/:path*'],
};