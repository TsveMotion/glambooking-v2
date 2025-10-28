import { auth, clerkClient as getClerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

const SUPER_ADMIN_EMAIL = 'kristiyan@tsvweb.com'

/**
 * Verifies if the current user is the authorized super admin
 * @returns Object with authorized status and user data
 */
export async function verifySuperAdmin() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return { authorized: false, error: 'Unauthorized', status: 401 }
    }

    // Get user from Clerk directly to ensure we have the email
    const clerkClient = getClerkClient()
    const clerkUser = await clerkClient.users.getUser(userId)
    
    const primaryEmail = clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress

    // Verify user is the authorized super admin
    if (primaryEmail?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return { 
        authorized: false, 
        error: 'Forbidden', 
        status: 403, 
        user: null 
      }
    }

    return { 
      authorized: true, 
      error: null, 
      status: 200, 
      user: { email: primaryEmail, clerkId: userId } 
    }
  } catch (error) {
    console.error('Super Admin Auth Error:', error)
    return { 
      authorized: false, 
      error: 'Internal Server Error', 
      status: 500, 
      user: null 
    }
  }
}

/**
 * Check if an email is the super admin email
 */
export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
}
