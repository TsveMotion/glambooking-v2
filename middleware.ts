import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/public(.*)',
  '/api/stripe-webhook',
  '/book/(.*)',
  '/pricing',
  '/about',
  '/contact',
  '/demo',
])

export default clerkMiddleware((auth, req) => {
  // Don't protect public routes
  if (isPublicRoute(req)) {
    return
  }
  
  // Protect all other routes
  auth().protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
