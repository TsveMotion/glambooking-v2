import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const { businessId } = params

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }

    // Fetch business with services and staff
    const business = await prisma.business.findUnique({
      where: { 
        id: businessId,
        isActive: true 
      },
      include: {
        services: {
          where: {
            isActive: true
          },
          orderBy: {
            name: 'asc'
          }
        },
        staff: {
          where: {
            isActive: true
          },
          orderBy: {
            firstName: 'asc'
          }
        }
      }
    })

    if (!business) {
      return NextResponse.json({ 
        error: 'Business not found or inactive' 
      }, { status: 404 })
    }

    // Format the response
    const businessData = {
      id: business.id,
      name: business.name,
      description: business.description || '',
      address: business.address || '',
      phone: business.phone || '',
      email: business.email || '',
      website: business.website || '',
      imageUrl: business.imageUrl || '',
      services: business.services.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description || '',
        duration: service.duration,
        price: Number(service.price),
        category: service.category || 'General'
      })),
      staff: business.staff.map(staff => ({
        id: staff.id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role,
        email: staff.email || '',
        imageUrl: staff.imageUrl || ''
      }))
    }

    return NextResponse.json(businessData)
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { error: 'Error fetching business data' },
      { status: 500 }
    )
  }
}
