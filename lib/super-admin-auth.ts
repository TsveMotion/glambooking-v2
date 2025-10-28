import { auth, clerkClient } from '@clerk/nextjs/server'
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
      console.log('❌ Super Admin Auth: No userId')
      return { authorized: false, error: 'Not authenticated', status: 401, user: null }
    }

    // Get user from Clerk directly to ensure we have the email
    const clerkUser = await clerkClient.users.getUser(userId)
    
    if (!clerkUser) {
      console.log('❌ Super Admin Auth: Clerk user not found')
      return { authorized: false, error: 'User not found in Clerk', status: 404, user: null }
    }

    // Get primary email from Clerk
    const primaryEmail = clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress

    console.log('🔐 Super Admin Auth Check:', {
      userId,
      email: primaryEmail,
      expectedEmail: SUPER_ADMIN_EMAIL,
      match: primaryEmail?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
    })

    // Verify user is the authorized super admin
    if (primaryEmail?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      console.log('❌ Super Admin Auth: Email does not match. User:', primaryEmail, 'Expected:', SUPER_ADMIN_EMAIL)
      return { 
        authorized: false, 
        error: 'Forbidden - Super Admin access only', 
        status: 403, 
        user: null 
      }
    }

    console.log('✅ Super Admin Auth: User authorized')
    return { authorized: true, error: null, status: 200, user: { email: primaryEmail, clerkId: userId } }
  } catch (error) {
    console.error('❌ Error verifying super admin:', error)
    return { 
      authorized: false, 
      error: 'Internal server error', 
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
