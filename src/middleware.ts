import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

/**
 * Middleware Configuration for WorkloadWizard
 * 
 * Handles authentication and authorization for all routes.
 * Updated for new database schema and enhanced security.
 */

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  // Public pages
  '/',
  '/login(.*)',
  '/sign-up(.*)',
  '/forgot-password(.*)',
  '/reset-password(.*)',
  
  // API routes that don't require auth
  '/api/knock-sync(.*)',
  '/api/test-runner(.*)',
  '/api/test-history(.*)',
  '/api/health(.*)',
  '/api/version(.*)',
  '/api/public(.*)',
  
  // Static assets and public files
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
  
  // Monitoring and health check endpoints
  '/monitoring(.*)',
  '/health(.*)',
  '/status(.*)',
])

// Define admin routes that require admin privileges
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
])

// Define organisation-scoped routes
const isOrganisationRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/lecturer-management(.*)',
  '/module-management(.*)',
  '/module-allocations(.*)',
  '/course-management(.*)',
  '/cohort-management(.*)',
  '/team-management(.*)',
  '/reports(.*)',
  '/api/organisation(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth.getToken();
  const pathname = req.nextUrl.pathname;
  
  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return;
  }
  
  // Require authentication for all other routes
  if (!userId) {
    await auth.protect();
    return;
  }
  
  // Check for admin routes
  if (isAdminRoute(req)) {
    // Verify admin privileges
    const isAdmin = sessionClaims?.metadata?.role === 'admin' || 
                   sessionClaims?.metadata?.isAdmin === true;
    
    if (!isAdmin) {
      // Redirect to dashboard if not admin
      const dashboardUrl = new URL('/dashboard', req.url);
      return Response.redirect(dashboardUrl);
    }
  }
  
  // Check for organisation-scoped routes
  if (isOrganisationRoute(req)) {
    // Verify user has an organisation
    const organisationId = sessionClaims?.metadata?.organisationId;
    
    if (!organisationId) {
      // Redirect to organisation setup if no organisation
      const setupUrl = new URL('/setup/organisation', req.url);
      return Response.redirect(setupUrl);
    }
  }
  
  // Add security headers
  const response = await auth.protect();
  
  // Add security headers for all authenticated requests
  if (response) {
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Add CSP header for additional security
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.convex.cloud;"
    );
  }
  
  return response;
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}