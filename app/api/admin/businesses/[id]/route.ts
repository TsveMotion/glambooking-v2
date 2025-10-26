import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = 'kristiyan@tsvweb.com'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
    const { name, email, phone, website, address, description, isActive } = body

    // Update the business
    const updatedBusiness = await prisma.business.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone: phone || null,
        website: website || null,
        address: address || null,
        description: description || null,
        isActive
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

    // Calculate revenue
    let totalRevenue = 0
    let platformRevenue = 0

    try {
      const payments = await prisma.payment.findMany({
        where: {
          booking: {
            businessId: params.id
          },
          status: 'COMPLETED'
        }
      })

      totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
      platformRevenue = payments.reduce((sum, payment) => sum + Number(payment.platformFee), 0)
    } catch (error) {
      console.log('Error fetching payments for business:', params.id, error)
    }

    // Format the response
    const formattedBusiness = {
      ...updatedBusiness,
      serviceCount: updatedBusiness._count.services,
      bookingCount: updatedBusiness._count.bookings,
      staffCount: updatedBusiness._count.staff,
      totalRevenue,
      platformRevenue
    }

    return NextResponse.json(formattedBusiness)
  } catch (error) {
    console.error('Error updating business:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Delete the business (this will cascade to related records)
    await prisma.business.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting business:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
