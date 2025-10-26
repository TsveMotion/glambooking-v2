import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    const business = user.businesses[0]

    // Get available balance (this would normally integrate with Stripe Connect)
    const payments = await prisma.payment.findMany({
      where: {
        booking: {
          businessId: business.id
        },
        status: 'COMPLETED'
      }
    })

    const totalEarnings = payments.reduce((sum, payment) => sum + Number(payment.businessAmount), 0)
    const availableBalance = totalEarnings * 0.8 // 80% available for demo

    if (availableBalance <= 0) {
      return NextResponse.json({ 
        error: 'No funds available for payout' 
      }, { status: 400 })
    }

    // In a real implementation, this would:
    // 1. Create a Stripe transfer to the connected account
    // 2. Record the payout request in the database
    // 3. Update the available balance

    // For demo purposes, we'll just simulate success
    console.log(`Payout request for £${availableBalance.toFixed(2)} submitted for business ${business.id}`)

    return NextResponse.json({ 
      success: true,
      amount: availableBalance,
      message: 'Payout request submitted successfully'
    })
  } catch (error) {
    console.error('Error requesting payout:', error)
    return NextResponse.json(
      { error: 'Error processing payout request' },
      { status: 500 }
    )
  }
}
