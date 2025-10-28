'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Wallet,
  Calendar
} from 'lucide-react'

interface FundsData {
  availableFunds: {
    total: number
    platformFees: number
    netAmount: number
    bookingsCount: number
  }
  pendingFunds: {
    total: number
    bookingsCount: number
  }
  readyToComplete: {
    total: number
    bookingsCount: number
    bookings: Array<{
      id: string
      clientName: string
      serviceName: string
      staffName: string
      totalAmount: number
      endTime: string
    }>
  }
  completedBookings: Array<{
    id: string
    clientName: string
    serviceName: string
    staffName: string
    totalAmount: number
    completedAt: string
    fundsAvailableAt: string
  }>
  businessPlan: string
  feePercentage: number
}

export default function EarningsPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [fundsData, setFundsData] = useState<FundsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login')
      return
    }
    
    if (isLoaded && userId) {
      fetchFundsData()
    }
  }, [isLoaded, userId, router])

  const fetchFundsData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/business/funds')
      
      if (!response.ok) {
        throw new Error('Failed to fetch funds data')
      }
      
      const data = await response.json()
      setFundsData(data)
    } catch (error) {
      console.error('Error fetching funds:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading earnings...</p>
        </div>
      </div>
    )
  }

  if (!fundsData) {
    return null
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings & Payouts</h1>
        <p className="text-gray-600">Manage your available funds and track completed bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Available to Withdraw</p>
              <p className="text-3xl font-bold text-gray-900">£{fundsData.availableFunds.netAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {fundsData.availableFunds.bookingsCount} completed bookings
              </p>
              <p className="text-xs text-gray-500">
                Platform fee ({fundsData.feePercentage}% - includes Stripe fees): £{fundsData.availableFunds.platformFees.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Pending Bookings</p>
              <p className="text-3xl font-bold text-gray-900">£{fundsData.pendingFunds.total.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {fundsData.pendingFunds.bookingsCount} upcoming bookings
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
              <Calendar className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Ready to Complete</p>
              <p className="text-3xl font-bold text-gray-900">£{fundsData.readyToComplete.total.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {fundsData.readyToComplete.bookingsCount} bookings awaiting completion
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ready to Complete Section */}
      {fundsData.readyToComplete.bookingsCount > 0 && (
        <Card className="border-0 shadow-lg mb-8 bg-gradient-to-r from-amber-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Bookings Ready to Complete</CardTitle>
                <CardDescription>These appointments have finished - mark them as completed to release funds</CardDescription>
              </div>
              <Button 
                onClick={() => router.push('/business/calendar')}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Go to Calendar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fundsData.readyToComplete.bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-200">
                  <div>
                    <p className="font-semibold text-gray-900">{booking.clientName}</p>
                    <p className="text-sm text-gray-600">{booking.serviceName} • {booking.staffName}</p>
                    <p className="text-xs text-gray-500">
                      Ended: {new Date(booking.endTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">£{booking.totalAmount}</p>
                    <p className="text-xs text-amber-600 font-medium">Awaiting completion</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Bookings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Completed Bookings</CardTitle>
          <CardDescription>Funds from these bookings are available for withdrawal</CardDescription>
        </CardHeader>
        <CardContent>
          {fundsData.completedBookings.length > 0 ? (
            <div className="space-y-3">
              {fundsData.completedBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{booking.clientName}</p>
                    <p className="text-sm text-gray-600">{booking.serviceName} • {booking.staffName}</p>
                    <p className="text-xs text-gray-500">
                      Completed: {new Date(booking.completedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">£{booking.totalAmount}</p>
                    <div className="flex items-center text-xs text-green-600 font-medium mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Funds available
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-2">No completed bookings yet</p>
              <p className="text-sm text-gray-400">Complete bookings to see available funds here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Info */}
      <Card className="border-0 shadow-lg mt-8 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How Withdrawals Work</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Funds become available immediately after marking a booking as completed</li>
                <li>• Platform fee of {fundsData.feePercentage}% is deducted from each booking (includes Stripe processing fees)</li>
                <li>• Customers pay the service price only - no extra fees added</li>
                <li>• You can withdraw available funds at any time</li>
                <li>• Withdrawals are processed within 1-3 business days</li>
              </ul>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                <Wallet className="w-4 h-4 mr-2" />
                Request Withdrawal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
