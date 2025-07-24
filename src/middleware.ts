import { NextResponse } from 'next/server';
import { auth } from '../auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  // Allow unauthenticated access to root and /login
  if (pathname === '/' || pathname.startsWith('/login')) {
    return NextResponse.next();
  }
  // If not authenticated, redirect to /login
  if (!req.auth) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Exclude Next.js internals and static assets from middleware
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|public|images|fonts).*)',
  ],
};