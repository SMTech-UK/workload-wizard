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

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }
  
  auth.protect();
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}