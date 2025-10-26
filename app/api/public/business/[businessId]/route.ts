import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const { businessId } = params

    // Find business with customization settings
    const business = await prisma.business.findUnique({
      where: { 
        id: businessId,
        isActive: true
      },
      include: {
        customization: true
      }
    })

    if (!business) {
      return NextResponse.json({ 
        error: 'Business not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      business: {
        id: business.id,
        name: business.name,
        description: business.description,
        address: business.address,
        phone: business.phone,
        email: business.email,
        website: business.website,
        imageUrl: business.imageUrl,
        customization: business.customization?.settings || null
      }
    })
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { error: 'Error fetching business information' },
      { status: 500 }
    )
  }
}
