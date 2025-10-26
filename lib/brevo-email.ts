// Use fetch API instead of the problematic SDK
const BREVO_API_URL = 'https://api.brevo.com/v3'
const BREVO_API_KEY = process.env.BREVO_API_KEY!

interface EmailData {
  to: string
  name: string
  businessName: string
  role: string
  inviteLink?: string
  dashboardLink?: string
}

export class BrevoEmailService {
  // Send team invitation email
  async sendTeamInvitation(data: EmailData): Promise<boolean> {
    try {
      const htmlContent = this.generateInvitationHTML(data)
      
      const emailPayload = {
        sender: {
          name: 'GlamBooking Team',
          email: 'noreply@glambooking.co.uk'
        },
        to: [{
          email: data.to,
          name: data.name
        }],
        subject: `You've been invited to join ${data.businessName} on GlamBooking`,
        htmlContent: htmlContent
      }

      const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': BREVO_API_KEY
        },
        body: JSON.stringify(emailPayload)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Invitation email sent successfully:', result.messageId)
        return true
      } else {
        const error = await response.text()
        console.error('Failed to send invitation email:', error)
        return false
      }
    } catch (error) {
      console.error('Failed to send invitation email:', error)
      return false
    }
  }

  // Send welcome email after signup
  async sendWelcomeEmail(data: EmailData): Promise<boolean> {
    try {
      const htmlContent = this.generateWelcomeHTML(data)
      
      const emailPayload = {
        sender: {
          name: 'GlamBooking Team',
          email: 'noreply@glambooking.co.uk'
        },
        to: [{
          email: data.to,
          name: data.name
        }],
        subject: `Welcome to ${data.businessName} - Your Dashboard Access`,
        htmlContent: htmlContent
      }

      const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': BREVO_API_KEY
        },
        body: JSON.stringify(emailPayload)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Welcome email sent successfully:', result.messageId)
        return true
      } else {
        const error = await response.text()
        console.error('Failed to send welcome email:', error)
        return false
      }
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      return false
    }
  }

  private generateInvitationHTML(data: EmailData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Invitation - ${data.businessName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 24px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 16px;
            color: #6b7280;
        }
        .content {
            margin: 30px 0;
        }
        .business-info {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .role-badge {
            background: #dbeafe;
            color: #1e40af;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .features {
            margin: 20px 0;
        }
        .feature {
            display: flex;
            align-items: center;
            margin: 10px 0;
            color: #374151;
        }
        .feature-icon {
            width: 20px;
            height: 20px;
            background: #10b981;
            border-radius: 50%;
            margin-right: 12px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">💄 GlamBooking</div>
            <h1 class="title">You're Invited!</h1>
            <p class="subtitle">Join ${data.businessName} as a team member</p>
        </div>

        <div class="content">
            <p>Hi ${data.name},</p>
            
            <p>Great news! You've been invited to join <strong>${data.businessName}</strong> as a <span class="role-badge">${data.role}</span> on GlamBooking - the premier beauty business management platform.</p>

            <div class="business-info">
                <h3 style="margin-top: 0; color: #1f2937;">What's Next?</h3>
                <p style="margin-bottom: 0;">Click the button below to create your account and get started with your new role at ${data.businessName}.</p>
            </div>

            <a href="${data.inviteLink || `${process.env.NEXT_PUBLIC_APP_URL}/signup?email=${encodeURIComponent(data.to)}&role=${encodeURIComponent(data.role)}&business=${encodeURIComponent(data.businessName)}`}" class="cta-button">
                Create Your Account
            </a>

            <div class="features">
                <h3 style="color: #1f2937;">What you'll get access to:</h3>
                <div class="feature">
                    <span class="feature-icon"></span>
                    Professional dashboard for managing your work
                </div>
                <div class="feature">
                    <span class="feature-icon"></span>
                    Calendar integration for appointments
                </div>
                <div class="feature">
                    <span class="feature-icon"></span>
                    Client management tools
                </div>
                <div class="feature">
                    <span class="feature-icon"></span>
                    Real-time notifications and updates
                </div>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                This invitation will expire in 7 days. If you have any questions, please contact your business administrator.
            </p>
        </div>

        <div class="footer">
            <p>© 2025 GlamBooking. All rights reserved.</p>
            <p>This email was sent from a secure, monitored email address. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `
  }

  private generateWelcomeHTML(data: EmailData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${data.businessName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 24px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 16px;
            color: #6b7280;
        }
        .content {
            margin: 30px 0;
        }
        .welcome-box {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #0ea5e9;
        }
        .role-badge {
            background: #dbeafe;
            color: #1e40af;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
        }
        .secondary-button {
            display: inline-block;
            background: #f3f4f6;
            color: #374151;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            margin: 10px 5px;
            text-align: center;
            border: 1px solid #d1d5db;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .quick-links {
            margin: 30px 0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">💄 GlamBooking</div>
            <h1 class="title">Welcome to the Team!</h1>
            <p class="subtitle">Your account is ready at ${data.businessName}</p>
        </div>

        <div class="content">
            <p>Hi ${data.name},</p>
            
            <p>Congratulations! Your account has been successfully created and you're now part of the <strong>${data.businessName}</strong> team as a <span class="role-badge">${data.role}</span>.</p>

            <div class="welcome-box">
                <h3 style="margin-top: 0; color: #0f172a;">🎉 You're all set!</h3>
                <p style="margin-bottom: 0;">Your dashboard is ready and waiting. Click below to access your personalized workspace and start managing your beauty business tasks.</p>
            </div>

            <a href="${data.dashboardLink || `${process.env.NEXT_PUBLIC_APP_URL}/staff/dashboard`}" class="cta-button">
                Access Your Dashboard
            </a>

            <div class="quick-links">
                <h3 style="color: #1f2937;">Quick Links:</h3>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/staff/calendar" class="secondary-button">📅 View Calendar</a>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/staff/clients" class="secondary-button">👥 Manage Clients</a>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/staff/profile" class="secondary-button">⚙️ Update Profile</a>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h4 style="margin-top: 0; color: #92400e;">💡 Getting Started Tips:</h4>
                <ul style="margin-bottom: 0; color: #92400e;">
                    <li>Complete your profile to help clients recognize you</li>
                    <li>Check your calendar for upcoming appointments</li>
                    <li>Familiarize yourself with the client management tools</li>
                    <li>Set up your notification preferences</li>
                </ul>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Need help getting started? Contact your business administrator or check out our help center for tutorials and guides.
            </p>
        </div>

        <div class="footer">
            <p>© 2025 GlamBooking. All rights reserved.</p>
            <p>You're receiving this email because you were added as a team member. Manage your email preferences in your dashboard.</p>
        </div>
    </div>
</body>
</html>
    `
  }
}

export const brevoEmailService = new BrevoEmailService()
