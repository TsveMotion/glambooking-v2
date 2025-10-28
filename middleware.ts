import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

const hasClerkKeys = Boolean(process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)

const middleware = hasClerkKeys
  ? clerkMiddleware(async (auth, req) => {
      const hostname = req.headers.get('host') || ''
      const url = req.nextUrl

      // Check if this is the super admin subdomain
      if (hostname.startsWith('admin.localhost') || hostname === 'admin.glambooking.com') {
        const path = url.pathname
        const isSuperAdminApiRoute = path.startsWith('/api/super-admin')
        const isSuperAdminPage = path.startsWith('/super-admin')
        const isAuthRoute = path.startsWith('/sign-in') || path.startsWith('/sign-up')

        const ensureAuthorized = async () => {
          const { userId } = auth()
          if (!userId) {
            return { authorized: false, response: NextResponse.redirect(new URL('/sign-in?redirect_url=/super-admin', req.url)) }
          }

          try {
            const { clerkClient } = await import('@clerk/nextjs/server')
            const clerkUser = await clerkClient.users.getUser(userId)
            const primaryEmail = clerkUser.emailAddresses.find(
              (email) => email.id === clerkUser.primaryEmailAddressId
            )?.emailAddress

            console.log('🔐 Middleware Super Admin Check:', {
              userId,
              email: primaryEmail,
              path,
              authorized: primaryEmail?.toLowerCase() === 'kristiyan@tsvweb.com'
            })

            if (primaryEmail?.toLowerCase() !== 'kristiyan@tsvweb.com') {
              console.log('❌ Middleware: Blocking unauthorized access from', primaryEmail)
              return { authorized: false, response: NextResponse.redirect(new URL('/', req.url)) }
            }

            console.log('✅ Middleware: Authorized super admin access')
            return { authorized: true, response: NextResponse.next() }
          } catch (error) {
            console.error('❌ Middleware: Error checking super admin email:', error)
            return { authorized: false, response: NextResponse.redirect(new URL('/', req.url)) }
          }
        }

        if (isSuperAdminApiRoute) {
          const result = await ensureAuthorized()
          return result.response
        }

        if (isSuperAdminPage) {
          const result = await ensureAuthorized()
          return result.response
        }

        if (isAuthRoute) {
          return NextResponse.next()
        }

        // Redirect any other path on the admin subdomain to the dashboard
        return NextResponse.redirect(new URL('/super-admin', req.url))
      }

      // CRITICAL: Block /super-admin access from ANY domain that is NOT admin subdomain
      if (url.pathname.startsWith('/super-admin')) {
        return NextResponse.redirect(new URL('/', req.url))
      }

      // Check for white-label domain
      let whitelabelConfig = null
      
      // Skip white-label check for main domain and localhost
      if (!hostname.includes('localhost') && !hostname.startsWith('glambooking.com')) {
        try {
          // Check if this is a custom domain or subdomain
          const isSubdomain = hostname.includes('.glambooking.com') && !hostname.startsWith('www.')
          const subdomain = isSubdomain ? hostname.split('.glambooking.com')[0] : null
          const customDomain = !isSubdomain ? hostname : null

          if (subdomain || customDomain) {
            // @ts-ignore - Prisma client will be regenerated
            whitelabelConfig = await prisma.whiteLabelConfig?.findFirst({
              where: {
                OR: [
                  { subdomain: subdomain },
                  { customDomain: customDomain }
                ],
                isActive: true
              },
              include: {
                business: true
              }
            }).catch(() => null)
          }
        } catch (error) {
          console.error('Error fetching white-label config:', error)
        }
      }

      // Create response with white-label headers
      const response = NextResponse.next()
      
      if (whitelabelConfig) {
        // Inject white-label configuration into headers for use in pages
        response.headers.set('x-whitelabel-id', whitelabelConfig.id)
        response.headers.set('x-whitelabel-business-id', whitelabelConfig.businessId)
        response.headers.set('x-whitelabel-brand-name', whitelabelConfig.brandName || '')
        response.headers.set('x-whitelabel-primary-color', whitelabelConfig.primaryColor)
        response.headers.set('x-whitelabel-secondary-color', whitelabelConfig.secondaryColor)
        response.headers.set('x-whitelabel-logo-url', whitelabelConfig.logoUrl || '')
      }

      // Allow public routes
      if (isPublicRoute(req)) {
        return response
      }
      
      // Protect all other routes
      if (isProtectedRoute(req)) {
        auth().protect()
      }
      
      return response
    })
  : (req: NextRequest) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          'Clerk middleware disabled because CLERK_PUBLISHABLE_KEY/CLERK_SECRET_KEY are missing. ' +
            'Authentication is bypassed for local development. '
        )
      }
      return NextResponse.next()
    }

export default middleware

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
