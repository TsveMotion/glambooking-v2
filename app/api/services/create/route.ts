import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, duration, price, category } = await req.json()

    if (!name || !duration || !price) {
      return NextResponse.json({ 
        error: 'Name, duration, and price are required' 
      }, { status: 400 })
    }

    // Find user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: true
      }
    })

    if (!user || user.businesses.length === 0) {
      return NextResponse.json({ 
        error: 'No business found for user' 
      }, { status: 404 })
    }

    const business = user.businesses[0] // Get first business

    // Create the service
    const service = await prisma.service.create({
      data: {
        name,
        description: description || '',
        duration: parseInt(duration),
        price: parseFloat(price),
        category: category || 'General',
        businessId: business.id,
        isActive: true
      }
    })

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Error creating service' },
      { status: 500 }
    )
  }
}
