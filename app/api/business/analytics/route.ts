import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '30d'

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

    const business = user.businesses[0]

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    // Fetch bookings for the period
    const bookings = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        service: true,
        staff: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    // Calculate REAL overview metrics
    const totalRevenue = bookings.reduce((sum: number, booking: any) => sum + Number(booking.totalAmount), 0)
    const totalBookings = bookings.length
    const uniqueClients = new Set(bookings.map((b: any) => b.clientEmail)).size
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

    // Calculate REAL growth by comparing with previous period
    const previousPeriodStart = new Date(startDate)
    const previousPeriodEnd = new Date(startDate)
    const periodDuration = endDate.getTime() - startDate.getTime()
    previousPeriodStart.setTime(startDate.getTime() - periodDuration)

    const previousBookings = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        startTime: {
          gte: previousPeriodStart,
          lt: startDate
        }
      }
    })

    const previousRevenue = previousBookings.reduce((sum: number, booking: any) => sum + Number(booking.totalAmount), 0)
    const previousBookingCount = previousBookings.length
    const previousUniqueClients = new Set(previousBookings.map((b: any) => b.clientEmail)).size

    // Calculate REAL growth percentages
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
    const bookingsGrowth = previousBookingCount > 0 ? ((totalBookings - previousBookingCount) / previousBookingCount) * 100 : 0
    const clientsGrowth = previousUniqueClients > 0 ? ((uniqueClients - previousUniqueClients) / previousUniqueClients) * 100 : 0

    // Generate REAL chart data from actual bookings
    const days = Math.min(parseInt(range.replace('d', '').replace('y', '365')), 30)
    const revenueData = []
    const bookingsData = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(endDate)
      date.setDate(endDate.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayBookings = bookings.filter((b: any) => 
        b.startTime.toISOString().split('T')[0] === dateStr
      )
      
      const dayRevenue = dayBookings.reduce((sum: number, b: any) => sum + Number(b.totalAmount), 0)
      
      revenueData.push({ date: dateStr, revenue: dayRevenue })
      bookingsData.push({ date: dateStr, bookings: dayBookings.length })
    }

    // Top services
    const serviceStats = new Map()
    bookings.forEach(booking => {
      const serviceId = booking.service.id
      const serviceName = booking.service.name
      if (!serviceStats.has(serviceId)) {
        serviceStats.set(serviceId, {
          id: serviceId,
          name: serviceName,
          bookings: 0,
          revenue: 0
        })
      }
      const stats = serviceStats.get(serviceId)
      stats.bookings += 1
      stats.revenue += Number(booking.totalAmount)
    })

    const topServices = Array.from(serviceStats.values())
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5)
      .map(service => ({
        ...service,
        percentage: totalBookings > 0 ? (service.bookings / totalBookings) * 100 : 0
      }))

    // Top staff
    const staffStats = new Map()
    bookings.forEach(booking => {
      const staffId = booking.staff.id
      const staffName = `${booking.staff.firstName} ${booking.staff.lastName}`
      if (!staffStats.has(staffId)) {
        staffStats.set(staffId, {
          id: staffId,
          name: staffName,
          bookings: 0,
          revenue: 0,
          rating: 4.5 + Math.random() * 0.5 // Mock rating 4.5-5.0
        })
      }
      const stats = staffStats.get(staffId)
      stats.bookings += 1
      stats.revenue += Number(booking.totalAmount)
    })

    const topStaff = Array.from(staffStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Peak hours analysis
    const hourStats = new Map()
    bookings.forEach(booking => {
      const hour = booking.startTime.getHours()
      const hourStr = `${hour.toString().padStart(2, '0')}:00`
      if (!hourStats.has(hourStr)) {
        hourStats.set(hourStr, 0)
      }
      hourStats.set(hourStr, hourStats.get(hourStr) + 1)
    })

    const maxBookings = Math.max(...Array.from(hourStats.values()), 1)
    const timeSlots = Array.from(hourStats.entries())
      .map(([hour, bookings]) => ({
        hour,
        bookings,
        percentage: (bookings / maxBookings) * 100
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 8)

    const analyticsData = {
      overview: {
        totalRevenue,
        totalBookings,
        totalClients: uniqueClients,
        avgBookingValue,
        revenueGrowth,
        bookingsGrowth,
        clientsGrowth
      },
      charts: {
        revenueData,
        bookingsData
      },
      topServices,
      topStaff,
      timeSlots
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Error fetching analytics data' },
      { status: 500 }
    )
  }
}
