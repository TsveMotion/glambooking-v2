import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== TEST DYNAMIC ROUTE ===')
  console.log('Received ID:', params.id)
  console.log('Request URL:', req.url)
  
  return NextResponse.json({
    message: 'Test route working',
    receivedId: params.id,
    timestamp: new Date().toISOString()
  })
}
