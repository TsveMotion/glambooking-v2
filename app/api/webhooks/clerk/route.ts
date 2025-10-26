import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'
import { brevoEmailService } from '@/lib/brevo-email'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    // Get the headers
    const headerPayload = headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error occured -- no svix headers', {
        status: 400,
      })
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Create a new Svix instance with your secret.
    const wh = new Webhook(webhookSecret)

    let evt: any

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as any
    } catch (err) {
      console.error('Error verifying webhook:', err)
      return new Response('Error occured', {
        status: 400,
      })
    }

    // Handle the webhook
    const eventType = evt.type
    console.log('Clerk webhook event:', eventType)

    if (eventType === 'user.created') {
      await handleUserCreated(evt.data)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleUserCreated(userData: any) {
  try {
    const { id: clerkId, email_addresses, first_name, last_name, image_url } = userData
    const primaryEmail = email_addresses.find((email: any) => email.id === userData.primary_email_address_id)?.email_address

    if (!primaryEmail) {
      console.error('No primary email found for user')
      return
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        clerkId,
        email: primaryEmail,
        firstName: first_name || null,
        lastName: last_name || null,
        imageUrl: image_url || null
      }
    })

    console.log('User created in database:', user.id)

    // Check if this user was invited to any teams
    const pendingInvitations = await prisma.teamInvitation.findMany({
      where: {
        email: primaryEmail,
        status: 'PENDING',
        expiresAt: {
          gte: new Date()
        }
      },
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Process each invitation
    for (const invitation of pendingInvitations) {
      try {
        // Create staff member
        await prisma.staff.create({
          data: {
            firstName: invitation.firstName,
            lastName: invitation.lastName,
            email: invitation.email,
            phone: invitation.phone,
            role: invitation.role,
            isActive: true,
            businessId: invitation.businessId,
            userId: user.id
          }
        })

        // Update invitation status
        await prisma.teamInvitation.update({
          where: { id: invitation.id },
          data: { status: 'ACCEPTED' }
        })

        // Send welcome email
        await brevoEmailService.sendWelcomeEmail({
          to: invitation.email,
          name: `${invitation.firstName} ${invitation.lastName}`,
          businessName: invitation.business.name,
          role: invitation.role,
          dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL}/staff/dashboard`
        })

        console.log(`Processed invitation for ${invitation.email} to ${invitation.business.name}`)
      } catch (error) {
        console.error(`Error processing invitation ${invitation.id}:`, error)
      }
    }

  } catch (error) {
    console.error('Error handling user creation:', error)
  }
}
