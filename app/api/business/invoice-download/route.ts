import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const invoiceId = searchParams.get('invoiceId')

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })
    }

    // Find user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: true
      }
    })

    if (!user || user.businesses.length === 0) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    try {
      // In a real app, you'd retrieve the invoice from Stripe
      // const invoice = await stripe.invoices.retrieve(invoiceId)
      
      // For now, generate a mock PDF invoice
      const mockInvoiceData = {
        id: invoiceId,
        number: `INV-${Date.now()}`,
        date: new Date().toISOString(),
        amount: 30.00,
        currency: 'GBP',
        status: 'paid',
        businessName: user.businesses[0].name,
        planName: 'Starter Plan'
      }

      // Generate PDF content (mock)
      const pdfContent = generateMockInvoicePDF(mockInvoiceData)

      return new NextResponse(pdfContent.toString('binary'), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="invoice-${invoiceId}.pdf"`
        }
      })

    } catch (stripeError) {
      console.error('Stripe invoice error:', stripeError)
      return NextResponse.json({ error: 'Failed to retrieve invoice' }, { status: 500 })
    }

  } catch (error) {
    console.error('Invoice download API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateMockInvoicePDF(invoiceData: any): Buffer {
  // This is a mock PDF generation - in a real app you'd use a PDF library like jsPDF or PDFKit
  const mockPdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
50 750 Td
(INVOICE) Tj
0 -20 Td
(Invoice #: ${invoiceData.number}) Tj
0 -20 Td
(Business: ${invoiceData.businessName}) Tj
0 -20 Td
(Plan: ${invoiceData.planName}) Tj
0 -20 Td
(Amount: £${invoiceData.amount}) Tj
0 -20 Td
(Status: ${invoiceData.status.toUpperCase()}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000251 00000 n 
0000000500 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
565
%%EOF
`

  return Buffer.from(mockPdfContent, 'utf-8')
}
