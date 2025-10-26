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

    // Get businesses with their stats
    let businessesWithRevenue: any[] = []
    
    try {
      const businesses = await prisma.business.findMany({
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: {
              services: true,
              bookings: true,
              staff: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Calculate revenue for each business
      businessesWithRevenue = await Promise.all(
        businesses.map(async (business) => {
          try {
            const payments = await prisma.payment.findMany({
              where: {
                booking: {
                  businessId: business.id
                },
                status: 'COMPLETED'
              }
            })

            const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
            const platformRevenue = payments.reduce((sum, payment) => sum + Number(payment.platformFee), 0)

            return {
              id: business.id,
              name: business.name,
              description: business.description,
              address: business.address,
              phone: business.phone,
              email: business.email,
              website: business.website,
              imageUrl: business.imageUrl,
              isActive: business.isActive,
              createdAt: business.createdAt,
              updatedAt: business.updatedAt,
              stripeAccountId: business.stripeAccountId,
              stripeOnboarded: business.stripeOnboarded,
              owner: business.owner,
              serviceCount: business._count.services,
              bookingCount: business._count.bookings,
              staffCount: business._count.staff,
              totalRevenue,
              platformRevenue
            }
          } catch (error) {
            console.log('Error fetching payments for business:', business.id, error)
            return {
              id: business.id,
              name: business.name,
              description: business.description,
              address: business.address,
              phone: business.phone,
              email: business.email,
              website: business.website,
              imageUrl: business.imageUrl,
              isActive: business.isActive,
              createdAt: business.createdAt,
              updatedAt: business.updatedAt,
              stripeAccountId: business.stripeAccountId,
              stripeOnboarded: business.stripeOnboarded,
              owner: business.owner,
              serviceCount: business._count.services,
              bookingCount: business._count.bookings,
              staffCount: business._count.staff,
              totalRevenue: 0,
              platformRevenue: 0
            }
          }
        })
      )
    } catch (error) {
      console.log('Error fetching businesses:', error)
      // Return empty array if database is unavailable
      businessesWithRevenue = []
    }

    return NextResponse.json({ 
      businesses: businessesWithRevenue,
      total: businessesWithRevenue.length
    })
  } catch (error) {
    console.error('Admin businesses API error:', error)
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
    const { name, email, phone, website, address, description, isActive, ownerId } = body

    // Validate required fields
    if (!name || !email || !ownerId) {
      return NextResponse.json({ error: 'Name, email, and owner are required' }, { status: 400 })
    }

    // Check if owner exists
    const owner = await prisma.user.findUnique({
      where: { id: ownerId }
    })

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    // Create the business
    const newBusiness = await prisma.business.create({
      data: {
        name,
        email,
        phone: phone || null,
        website: website || null,
        address: address || null,
        description: description || null,
        isActive: isActive ?? true,
        ownerId,
        stripeOnboarded: false
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            services: true,
            bookings: true,
            staff: true
          }
        }
      }
    })

    // Format the response to match the expected structure
    const formattedBusiness = {
      ...newBusiness,
      serviceCount: newBusiness._count.services,
      bookingCount: newBusiness._count.bookings,
      staffCount: newBusiness._count.staff,
      totalRevenue: 0,
      platformRevenue: 0
    }

    return NextResponse.json(formattedBusiness, { status: 201 })
  } catch (error) {
    console.error('Error creating business:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
