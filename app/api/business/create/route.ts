import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, address, phone, email, website, services, staff } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Business name and email are required' }, { status: 400 })
    }

    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: email,
        firstName: staff[0]?.name?.split(' ')[0] || '',
        lastName: staff[0]?.name?.split(' ').slice(1).join(' ') || '',
      }
    })

    // Create business
    const business = await prisma.business.create({
      data: {
        name,
        description,
        address,
        phone,
        email,
        website,
        ownerId: user.id,
        services: {
          create: services.map((service: any) => ({
            name: service.name,
            duration: service.duration,
            price: service.price,
            category: 'General'
          }))
        },
        staff: {
          create: {
            firstName: staff[0]?.name?.split(' ')[0] || 'Owner',
            lastName: staff[0]?.name?.split(' ').slice(1).join(' ') || '',
            email: staff[0]?.email || email,
            role: 'owner'
          }
        }
      },
      include: {
        services: true,
        staff: true
      }
    })

    return NextResponse.json({ business })
  } catch (error) {
    console.error('Error creating business:', error)
    return NextResponse.json(
      { error: 'Error creating business' },
      { status: 500 }
    )
  }
}
