import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Get all users for super admin
 */
export async function GET(req: NextRequest) {
  try {
    // Verify super admin authorization
    const authResult = await verifySuperAdmin()
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Fetch all users from Clerk
    const clerkUsersResponse = await clerkClient.users.getUserList({ limit: 100 })
    const clerkUsers = clerkUsersResponse.data || []

    // Get database users for additional data
    const dbUsers = await prisma.user.findMany({
      include: {
        businesses: {
          select: {
            id: true,
            name: true,
            isActive: true,
            isWhiteLabel: true
          }
        },
        bookings: {
          select: {
            id: true,
            status: true,
            totalAmount: true
          }
        },
        _count: {
          select: {
            businesses: true,
            bookings: true
          }
        }
      }
    })

    // Create a map of database users by clerkId for quick lookup
    const dbUserMap = new Map(dbUsers.map(u => [u.clerkId, u]))

    // Merge Clerk users with database data
    const formattedUsers = clerkUsers.map(clerkUser => {
      const dbUser = dbUserMap.get(clerkUser.id)
      const primaryEmail = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress || ''
      
      return {
        id: dbUser?.id || clerkUser.id,
        clerkId: clerkUser.id,
        email: primaryEmail,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
        lastSignInAt: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt).toISOString() : null,
        businessCount: dbUser?._count.businesses || 0,
        bookingCount: dbUser?._count.bookings || 0,
        businesses: dbUser?.businesses || [],
        totalSpent: dbUser?.bookings
          .filter(b => b.status === 'COMPLETED')
          .reduce((sum, b) => sum + Number(b.totalAmount), 0) || 0,
        isBusinessOwner: (dbUser?._count.businesses || 0) > 0,
        hasWhitelabel: dbUser?.businesses.some(b => b.isWhiteLabel) || false
      }
    })

    // Sort by creation date descending
    formattedUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      users: formattedUsers,
      total: formattedUsers.length
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Error fetching users' },
      { status: 500 }
    )
  }
}
