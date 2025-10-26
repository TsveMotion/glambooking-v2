import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { name, description, address, phone, email, website, services, staff } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Business name and email are required' }, { status: 400 })
    }

    // Create a demo user for the business owner
    const user = await prisma.user.upsert({
      where: { email: email },
      update: {},
      create: {
        clerkId: `demo_${Date.now()}`, // Demo clerk ID
        email: email,
        firstName: staff[0]?.name?.split(' ')[0] || 'Demo',
        lastName: staff[0]?.name?.split(' ').slice(1).join(' ') || 'Owner',
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
            category: 'Beauty'
          }))
        },
        staff: {
          create: {
            firstName: staff[0]?.name?.split(' ')[0] || 'Demo',
            lastName: staff[0]?.name?.split(' ').slice(1).join(' ') || 'Staff',
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
    console.error('Error creating demo business:', error)
    return NextResponse.json(
      { error: 'Error creating demo business' },
      { status: 500 }
    )
  }
}
