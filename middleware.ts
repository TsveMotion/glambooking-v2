import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/business(.*)',
  '/api/business(.*)',
  '/admin(.*)',
  '/api/admin(.*)'
])

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/signup(.*)',
  '/api/webhooks(.*)',
  '/book(.*)',
  '/pricing',
  '/about',
  '/contact',
  '/demo'
])

export default clerkMiddleware((auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return
  }
  
  // Protect all other routes
  if (isProtectedRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
