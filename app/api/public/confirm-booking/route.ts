import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { sendBookingConfirmationEmail, BookingEmailData } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  try {
    console.log('=== CONFIRM BOOKING API ===')
    const body = await req.json()
    const { sessionId } = body
    console.log('Session ID:', sessionId)

    if (!sessionId) {
      console.log('No session ID provided')
      return NextResponse.json({ 
        error: 'Session ID is required' 
      }, { status: 400 })
    }

    // Get the Stripe session
    console.log('Retrieving Stripe session...')
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    console.log('Session status:', session.payment_status)
    console.log('Payment intent:', session.payment_intent)

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ 
        error: 'Payment not confirmed' 
      }, { status: 400 })
    }

    // Find the booking by payment intent
    console.log('Looking for payment with intent:', session.payment_intent)
    let payment = await prisma.payment.findFirst({
      where: {
        stripePaymentId: session.payment_intent as string
      },
      include: {
        booking: {
          include: {
            service: true,
            staff: true,
            business: true
          }
        }
      }
    })

    // Also check if booking already exists by session ID to prevent duplicates
    const existingBookingBySession = await prisma.booking.findFirst({
      where: {
        // Use a combination of client info and session metadata to identify duplicates
        clientEmail: session.customer_details?.email || session.metadata?.clientEmail,
        startTime: session.metadata?.startTime ? new Date(session.metadata.startTime) : undefined,
        serviceId: session.metadata?.serviceId,
        staffId: session.metadata?.staffId
      },
      include: {
        service: true,
        staff: true,
        business: true
      }
    })

    if (existingBookingBySession && !payment) {
      console.log('Found existing booking by session data:', existingBookingBySession.id)
      // Find the payment for this existing booking
      payment = await prisma.payment.findFirst({
        where: { bookingId: existingBookingBySession.id },
        include: {
          booking: {
            include: {
              service: true,
              staff: true,
              business: true
            }
          }
        }
      })
    }

    console.log('Payment found:', payment?.id)
    console.log('Booking found:', payment?.booking?.id)

    // If no payment/booking found, create them from session metadata
    if (!payment || !payment.booking) {
      console.log('No payment or booking found, creating from session metadata...')
      
      const metadata = session.metadata
      if (!metadata) {
        console.log('No session metadata found')
        return NextResponse.json({ 
          error: 'Booking data not found' 
        }, { status: 404 })
      }

      console.log('Session metadata:', metadata)

      // Double-check for existing booking to prevent race conditions
      const finalCheck = await prisma.booking.findFirst({
        where: {
          clientEmail: metadata.clientEmail,
          startTime: new Date(metadata.startTime),
          serviceId: metadata.serviceId,
          staffId: metadata.staffId
        }
      })

      if (finalCheck) {
        console.log('Booking already exists (race condition prevented):', finalCheck.id)
        // Return the existing booking instead of creating a duplicate
        payment = await prisma.payment.findFirst({
          where: { bookingId: finalCheck.id },
          include: {
            booking: {
              include: {
                service: true,
                staff: true,
                business: true
              }
            }
          }
        })
      } else {
        // Create the booking first - wrap in try-catch to handle race conditions
        try {
          const booking = await prisma.booking.create({
            data: {
              businessId: metadata.businessId,
              serviceId: metadata.serviceId,
              staffId: metadata.staffId,
              clientName: metadata.clientName,
              clientEmail: metadata.clientEmail,
              clientPhone: metadata.clientPhone || '',
              startTime: new Date(metadata.startTime),
              endTime: new Date(metadata.endTime),
              totalAmount: session.amount_total! / 100, // Convert from pence to pounds
              status: 'CONFIRMED'
            },
            include: {
              service: true,
              staff: true,
              business: true
            }
          })

          console.log('Booking created:', booking.id)

          // Create the payment record
          payment = await prisma.payment.create({
            data: {
              bookingId: booking.id,
              amount: session.amount_total! / 100,
              platformFee: Number(metadata.platformFee) / 100,
              businessAmount: Number(metadata.businessAmount) / 100,
              currency: 'GBP',
              status: 'COMPLETED',
              stripePaymentId: session.payment_intent as string
            },
            include: {
              booking: {
                include: {
                  service: true,
                  staff: true,
                  business: true
                }
              }
            }
          })

          console.log('Payment created:', payment.id)
        } catch (createError: any) {
          // If unique constraint error, fetch the existing booking
          if (createError.code === 'P2002') {
            console.log('Duplicate booking detected (race condition), fetching existing...')
            const existingBooking = await prisma.booking.findFirst({
              where: {
                clientEmail: metadata.clientEmail,
                startTime: new Date(metadata.startTime),
                serviceId: metadata.serviceId,
                staffId: metadata.staffId
              },
              include: {
                service: true,
                staff: true,
                business: true
              }
            })

            if (existingBooking) {
              // Get or create payment for existing booking
              payment = await prisma.payment.findFirst({
                where: { bookingId: existingBooking.id },
                include: {
                  booking: {
                    include: {
                      service: true,
                      staff: true,
                      business: true
                    }
                  }
                }
              })

              // If no payment exists, create it
              if (!payment) {
                payment = await prisma.payment.create({
                  data: {
                    bookingId: existingBooking.id,
                    amount: session.amount_total! / 100,
                    platformFee: Number(metadata.platformFee) / 100,
                    businessAmount: Number(metadata.businessAmount) / 100,
                    currency: 'GBP',
                    status: 'COMPLETED',
                    stripePaymentId: session.payment_intent as string
                  },
                  include: {
                    booking: {
                      include: {
                        service: true,
                        staff: true,
                        business: true
                      }
                    }
                  }
                })
              }
              console.log('Using existing booking:', existingBooking.id)
            } else {
              throw createError // Re-throw if we can't find the booking
            }
          } else {
            throw createError // Re-throw if it's not a duplicate error
          }
        }
      }
    }

    const booking = payment.booking

    // Format the response
    const bookingDetails = {
      id: booking.id,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      status: booking.status,
      totalAmount: Number(booking.totalAmount),
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone,
      service: {
        name: booking.service.name,
        duration: booking.service.duration,
        price: Number(booking.service.price)
      },
      staff: {
        firstName: booking.staff.firstName,
        lastName: booking.staff.lastName
      },
      business: {
        id: booking.business.id,
        name: booking.business.name,
        address: booking.business.address,
        phone: booking.business.phone,
        email: booking.business.email
      }
    }

    console.log('Booking confirmation successful:', booking.id)

    // Send confirmation email to client
    try {
      const bookingDate = new Date(booking.startTime)
      const emailData: BookingEmailData = {
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        bookingId: booking.id,
        serviceName: booking.service.name,
        staffName: `${booking.staff.firstName} ${booking.staff.lastName}`,
        businessName: booking.business.name,
        businessAddress: booking.business.address || undefined,
        businessPhone: booking.business.phone || undefined,
        businessEmail: booking.business.email || undefined,
        appointmentDate: bookingDate.toLocaleDateString('en-GB', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        appointmentTime: bookingDate.toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        duration: booking.service.duration,
        totalAmount: Number(booking.totalAmount)
      }

      console.log('Sending confirmation email to:', booking.clientEmail)
      const emailResult = await sendBookingConfirmationEmail(emailData)
      
      if (emailResult.success) {
        console.log('Confirmation email sent successfully')
      } else {
        console.error('Failed to send confirmation email:', emailResult.error)
      }
    } catch (emailError) {
      console.error('Error preparing/sending confirmation email:', emailError)
      // Don't fail the booking confirmation if email fails
    }

    return NextResponse.json({ 
      booking: bookingDetails
    })
  } catch (error) {
    console.error('Error confirming booking:', error)
    return NextResponse.json(
      { error: 'Error confirming booking' },
      { status: 500 }
    )
  }
}
