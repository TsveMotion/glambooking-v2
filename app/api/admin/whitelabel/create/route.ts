import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient as getClerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createStripeCustomer, createWhiteLabelSubscription } from '@/lib/stripe-whitelabel'
import { sendEmail } from '@/lib/brevo-email'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    // Verify super admin authorization
    const authResult = await verifySuperAdmin()
    
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }
    
    const body = await req.json()
    const {
      businessName,
      email,
      ownerFirstName,
      ownerLastName,
      subdomain,
      customDomain,
      brandName,
      logoUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      platformFeePercentage,
      monthlyFee
    } = body

    // Validate required fields
    if (!businessName || !email || !ownerFirstName || !ownerLastName) {
      return NextResponse.json(
        { error: 'Missing required business information' },
        { status: 400 }
      )
    }

    if (!subdomain && !customDomain) {
      return NextResponse.json(
        { error: 'Either subdomain or custom domain is required' },
        { status: 400 }
      )
    }

    // Check if subdomain or domain already exists
    if (subdomain) {
      const existing = await prisma.whiteLabelConfig.findUnique({
        where: { subdomain }
      })
      if (existing) {
        return NextResponse.json(
          { error: 'Subdomain already in use' },
          { status: 400 }
        )
      }
    }

    if (customDomain) {
      const existing = await prisma.whiteLabelConfig.findUnique({
        where: { customDomain }
      })
      if (existing) {
        return NextResponse.json(
          { error: 'Custom domain already in use' },
          { status: 400 }
        )
      }
    }

    // Check if email already exists
    let user = await prisma.user.findUnique({
      where: { email }
    })

    // DON'T create Clerk user - let them sign up themselves
    // Create temp database user that will be linked when they sign up
    let clerkUserId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    let invitationSent = false
    let invitationMethod = 'none'
    let signUpUrl = ''

    if (!user) {
      console.log('Creating placeholder user for:', email)
      
      // Create database user with pending status
      user = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email,
          firstName: ownerFirstName,
          lastName: ownerLastName
        }
      })
      console.log('Database user created with pending status:', user.id)
    }

    // Create Stripe customer for billing
    let stripeCustomerId: string | undefined
    let subscriptionData: any = null
    
    try {
      stripeCustomerId = await createStripeCustomer(
        email,
        businessName,
        '' // Will update after business creation
      )
      
      // Note: Subscription creation happens after business is created
      // so we have the businessId for metadata
    } catch (stripeError) {
      console.error('Error creating Stripe customer:', stripeError)
      // Continue without Stripe - can be set up later
    }

    // Create business with white-label configuration
    const business = await prisma.business.create({
      data: {
        name: businessName,
        email,
        ownerId: user.id,
        isWhiteLabel: true,
        bookingFeePercentage: parseFloat(platformFeePercentage) || 1.0,
        plan: 'whitelabel',
        maxStaff: -1, // Unlimited staff for white-label
        stripeCustomerId: stripeCustomerId || null,
        whitelabelConfig: {
          create: {
            subdomain: subdomain || null,
            customDomain: customDomain || null,
            brandName: brandName || businessName,
            logoUrl: logoUrl || null,
            primaryColor: primaryColor || '#E91E63',
            secondaryColor: secondaryColor || '#FFD700',
            accentColor: accentColor || '#333333',
            platformFeePercentage: parseFloat(platformFeePercentage) || 1.0,
            monthlyFee: parseFloat(monthlyFee) || 200.0,
            isActive: true,
            subscriptionStatus: 'pending'
          }
        },
        // Create initial owner as staff member
        staff: {
          create: {
            firstName: ownerFirstName,
            lastName: ownerLastName,
            email,
            role: 'owner',
            isActive: true
          }
        }
      },
      include: {
        whitelabelConfig: true,
        staff: true
      }
    })

    // Create Stripe subscription for monthly billing
    if (stripeCustomerId) {
      try {
        subscriptionData = await createWhiteLabelSubscription(
          stripeCustomerId,
          business.id,
          parseFloat(monthlyFee) || 200
        )
        
        // Update white-label config with subscription details
        // @ts-ignore
        await prisma.whiteLabelConfig?.update({
          where: { businessId: business.id },
          data: {
            stripeSubscriptionId: subscriptionData.subscriptionId,
            subscriptionStatus: subscriptionData.status,
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          }
        }).catch(e => console.error('Error updating subscription info:', e))
      } catch (subError) {
        console.error('Error creating subscription:', subError)
        // Business is created, subscription can be set up later via admin panel
      }
    }

    // Determine sign-up URL (partner will create their own account)
    signUpUrl = business.whitelabelConfig?.subdomain
      ? `https://${business.whitelabelConfig.subdomain}.glambooking.co.uk/sign-up?email=${encodeURIComponent(email)}`
      : business.whitelabelConfig?.customDomain
      ? `https://${business.whitelabelConfig.customDomain}/sign-up?email=${encodeURIComponent(email)}`
      : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-up?email=${encodeURIComponent(email)}`

    const loginUrl = signUpUrl.replace('/sign-up', '/sign-in')
    const dashboardUrl = loginUrl.replace('/sign-in', '/business/dashboard')

    // Always send email via Brevo with sign-up link
    try {
      console.log('Sending setup email via Brevo to:', email)
        
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to Your White-Label Platform!</h1>
              </div>
              <div class="content">
                <p>Hi ${ownerFirstName},</p>
                
                <p>Congratulations! Your custom booking platform <strong>${brandName || businessName}</strong> is ready to go!</p>
                
                <div class="info-box">
                  <h3>📧 Your Account Setup:</h3>
                  <p><strong>Email:</strong> ${email}</p>
                  <p>Click the button below to create your account and set your password.</p>
                </div>

                <p><strong>Next Steps:</strong></p>
                <ol>
                  <li><strong>Create Your Account</strong> - Click the button below</li>
                  <li>Set your password</li>
                  <li>You'll be logged in automatically</li>
                  <li>Add your services and team</li>
                  <li>Start taking bookings!</li>
                </ol>

                <div style="text-align: center;">
                  <a href="${signUpUrl}" class="button">Create My Account →</a>
                </div>

                <p style="text-align: center; margin-top: 15px;">
                  <small style="color: #666;">Already have an account? <a href="${loginUrl}">Login here</a></small>
                </p>

                <div class="info-box">
                  <h3>🌐 Your Booking URLs:</h3>
                  ${business.whitelabelConfig?.subdomain ? `<p><strong>Subdomain:</strong> https://${business.whitelabelConfig.subdomain}.glambooking.co.uk</p>` : ''}
                  ${business.whitelabelConfig?.customDomain ? `<p><strong>Custom Domain:</strong> https://${business.whitelabelConfig.customDomain}</p>` : ''}
                  <p><small>Share these URLs with your customers to start accepting bookings!</small></p>
                </div>

                ${subscriptionData ? `
                <div class="info-box">
                  <h3>💳 Subscription Details:</h3>
                  <p><strong>Monthly Fee:</strong> £${business.whitelabelConfig?.monthlyFee || 200}</p>
                  <p><strong>Platform Fee:</strong> ${business.whitelabelConfig?.platformFeePercentage || 1}% per booking</p>
                  <p><strong>Status:</strong> ${subscriptionData.status}</p>
                </div>
                ` : ''}

                <p>Need help? Just reply to this email!</p>

                <p>Welcome aboard! 🚀</p>
                <p><strong>The GlamBooking Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated message from GlamBooking</p>
              </div>
            </div>
          </body>
          </html>
        `

      await sendEmail({
        to: email,
        subject: `🎉 Create Your Account - ${brandName || businessName} Platform Ready!`,
        html: emailHtml,
      })
      
      console.log('Setup email sent via Brevo')
      invitationSent = true
      invitationMethod = 'brevo'
    } catch (emailError) {
      console.error('Error sending setup email via Brevo:', emailError)
      invitationMethod = 'email_failed'
    }

    return NextResponse.json({
      success: true,
      businessId: business.id,
      message: 'White-label business created successfully',
      subscription: subscriptionData ? {
        id: subscriptionData.subscriptionId,
        clientSecret: subscriptionData.clientSecret,
        status: subscriptionData.status
      } : null,
      business: {
        id: business.id,
        name: business.name,
        subdomain: business.whitelabelConfig?.subdomain,
        customDomain: business.whitelabelConfig?.customDomain,
        brandName: business.whitelabelConfig?.brandName
      },
      invitation: {
        sent: invitationSent,
        method: invitationMethod,
        email: email,
        message: invitationSent 
          ? `Invitation sent via ${invitationMethod}. Partner should check email to get started.`
          : 'Failed to send invitation email. Please send login details manually.'
      },
      signUpUrl,
      loginUrl,
      dashboardUrl,
      nextSteps: {
        checkEmail: 'Partner should check email for sign-up link',
        signUpUrl: `${signUpUrl}`,
        createAccount: 'Click link in email to create account with password',
        setupPayment: subscriptionData?.clientSecret ? 'Complete payment setup with provided client secret' : 'Set up billing in admin panel',
        configureDNS: business.whitelabelConfig?.customDomain ? 'Configure DNS for custom domain' : 'N/A'
      }
    })
  } catch (error) {
    console.error('Error creating white-label business:', error)
    return NextResponse.json(
      { error: 'Error creating white-label business' },
      { status: 500 }
    )
  }
}
