import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { businessId, serviceId, staffId, date, time, clientInfo } = await req.json()

    if (!businessId || !serviceId || !staffId || !date || !time || !clientInfo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create or find client
    const client = await prisma.client.upsert({
      where: { 
        businessId_email: {
          businessId: businessId,
          email: clientInfo.email
        }
      },
      update: {
        firstName: clientInfo.firstName,
        lastName: clientInfo.lastName,
        phone: clientInfo.phone,
      },
      create: {
        firstName: clientInfo.firstName,
        lastName: clientInfo.lastName,
        email: clientInfo.email,
        phone: clientInfo.phone,
        businessId: businessId,
      }
    })

    // Get service details for pricing
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Create booking datetime
    const startTime = new Date(`${date}T${time}:00`)
    const endTime = new Date(startTime.getTime() + service.duration * 60000)

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        businessId,
        serviceId,
        staffId,
        startTime,
        endTime,
        clientName: `${client.firstName} ${client.lastName}`,
        clientEmail: client.email,
        clientPhone: client.phone || '',
        totalAmount: service.price,
        status: 'CONFIRMED',
        notes: '',
      },
      include: {
        service: true,
        staff: true,
        business: true
      }
    })

    // In a real app, you would:
    // 1. Send confirmation email to client
    // 2. Send notification to business
    // 3. Add to calendar
    // 4. Send SMS reminders

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Error creating booking' },
      { status: 500 }
    )
  }
}
