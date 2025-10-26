import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

const ADMIN_EMAIL = 'kristiyan@tsvweb.com'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details from Clerk to verify admin access
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to verify user' }, { status: 403 })
    }

    const userData = await response.json()
    const userEmail = userData.email_addresses?.find((email: any) => email.id === userData.primary_email_address_id)?.email_address

    if (userEmail !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get users with their businesses
    let formattedUsers: any[] = []
    
    try {
      const users = await prisma.user.findMany({
        include: {
          businesses: {
            select: {
              id: true,
              name: true,
              isActive: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              bookings: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      formattedUsers = users.map(user => ({
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        businessCount: user.businesses.length,
        bookingCount: user._count.bookings,
        businesses: user.businesses
      }))
    } catch (error) {
      console.log('Error fetching users:', error)
      // Return empty array if database is unavailable
      formattedUsers = []
    }

    return NextResponse.json({ 
      users: formattedUsers,
      total: formattedUsers.length
    })
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details from Clerk to verify admin access
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to verify user' }, { status: 403 })
    }

    const userData = await response.json()
    const userEmail = userData.email_addresses?.find((email: any) => email.id === userData.primary_email_address_id)?.email_address

    if (userEmail !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { firstName, lastName, email, clerkId } = body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'First name, last name, and email are required' }, { status: 400 })
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    }

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        clerkId: clerkId || `admin_created_${Date.now()}`, // Generate a unique ID if not provided
        imageUrl: null
      },
      include: {
        businesses: {
          select: {
            id: true,
            name: true,
            isActive: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      }
    })

    // Format the response to match the expected structure
    const formattedUser = {
      ...newUser,
      businessCount: newUser.businesses.length,
      bookingCount: newUser._count.bookings
    }

    return NextResponse.json(formattedUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
