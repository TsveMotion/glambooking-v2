import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== TEST INVITATION API ===')
  console.log('Received ID:', params.id)
  console.log('Full params:', params)
  
  return NextResponse.json({
    message: 'Test API working',
    receivedId: params.id,
    timestamp: new Date().toISOString()
  })
}
