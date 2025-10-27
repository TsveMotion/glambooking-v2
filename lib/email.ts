import * as SibApiV3Sdk from '@sendinblue/client'

interface BookingEmailData {
  clientName: string
  clientEmail: string
  bookingId: string
  serviceName: string
  staffName: string
  businessName: string
  businessAddress?: string
  businessPhone?: string
  businessEmail?: string
  appointmentDate: string
  appointmentTime: string
  duration: number
  totalAmount: number
}

// Create Brevo API client
const createBrevoClient = () => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
  apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!)
  return apiInstance
}

// Generate booking confirmation email HTML
const generateBookingEmailHTML = (data: BookingEmailData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; }
        .header h1 { margin: 0; font-size: 28px; }
        .booking-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .detail-label { font-weight: bold; color: #495057; }
        .detail-value { color: #212529; }
        .business-info { background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .total-amount { background-color: #d4edda; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .total-amount .amount { font-size: 24px; font-weight: bold; color: #155724; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px; }
        .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .important-note { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Booking Confirmed!</h1>
          <p>Your appointment has been successfully booked and paid for</p>
        </div>

        <p>Dear ${data.clientName},</p>
        <p>Thank you for your booking! Here are your appointment details:</p>

        <div class="booking-details">
          <h3>📅 Appointment Details</h3>
          <div class="detail-row">
            <span class="detail-label">Service:</span>
            <span class="detail-value">${data.serviceName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Staff Member:</span>
            <span class="detail-value">${data.staffName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${data.appointmentDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span class="detail-value">${data.appointmentTime}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">${data.duration} minutes</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Booking ID:</span>
            <span class="detail-value">${data.bookingId}</span>
          </div>
        </div>

        <div class="business-info">
          <h3>🏢 ${data.businessName}</h3>
          ${data.businessAddress ? `<p><strong>Address:</strong> ${data.businessAddress}</p>` : ''}
          ${data.businessPhone ? `<p><strong>Phone:</strong> ${data.businessPhone}</p>` : ''}
          ${data.businessEmail ? `<p><strong>Email:</strong> ${data.businessEmail}</p>` : ''}
        </div>

        <div class="total-amount">
          <p><strong>Total Paid</strong></p>
          <div class="amount">£${data.totalAmount.toFixed(2)}</div>
          <p><small>Payment processed securely via Stripe</small></p>
        </div>

        <div class="important-note">
          <h4>📝 Important Notes:</h4>
          <ul>
            <li>Please arrive 5-10 minutes before your appointment time</li>
            <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
            <li>Bring any specific requirements or preferences for your service</li>
            <li>Keep this email as your booking confirmation</li>
          </ul>
        </div>

        <div class="footer">
          <p>Thank you for choosing ${data.businessName}!</p>
          <p><small>This is an automated confirmation email. Please do not reply to this email.</small></p>
          <p><small>Powered by GlamBooking</small></p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Send booking confirmation email
export const sendBookingConfirmationEmail = async (bookingData: BookingEmailData) => {
  try {
    const apiInstance = createBrevoClient()

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
    sendSmtpEmail.subject = `Booking Confirmation - ${bookingData.serviceName} at ${bookingData.businessName}`
    sendSmtpEmail.htmlContent = generateBookingEmailHTML(bookingData)
    sendSmtpEmail.sender = { name: 'GlamBooking', email: 'noreply@glambooking.com' }
    sendSmtpEmail.to = [{ email: bookingData.clientEmail, name: bookingData.clientName }]
    sendSmtpEmail.textContent = `
      Booking Confirmation
      
      Dear ${bookingData.clientName},
      
      Your appointment has been confirmed!
      
      Service: ${bookingData.serviceName}
      Staff: ${bookingData.staffName}
      Date: ${bookingData.appointmentDate}
      Time: ${bookingData.appointmentTime}
      Duration: ${bookingData.duration} minutes
      Total Paid: £${bookingData.totalAmount.toFixed(2)}
      
      Location: ${bookingData.businessName}
      ${bookingData.businessAddress || ''}
      
      Booking ID: ${bookingData.bookingId}
      
      Please arrive 5-10 minutes early. If you need to reschedule, please contact us at least 24 hours in advance.
      
      Thank you for choosing ${bookingData.businessName}!
    `

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('Booking confirmation email sent successfully:', result.body?.messageId)
    return { success: true, messageId: result.body?.messageId }
  } catch (error) {
    console.error('Error sending booking confirmation email:', error)
    return { success: false, error: error.message }
  }
}

export type { BookingEmailData }
