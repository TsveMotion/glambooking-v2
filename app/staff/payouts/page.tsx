'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  DollarSign,
  CreditCard,
  TrendingUp,
  Calendar,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Eye,
  Banknote
} from 'lucide-react'

interface PayoutData {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed'
  date: string
  description: string
  stripePayoutId?: string
}

interface EarningsData {
  totalEarnings: number
  thisMonthEarnings: number
  pendingPayouts: number
  lastPayoutDate?: string
  nextPayoutDate?: string
  commissionRate: number
}

interface StripeAccount {
  id?: string
  isConnected: boolean
  isVerified: boolean
  requiresAction: boolean
  actionUrl?: string
}

interface StaffData {
  id: string
  firstName: string
  lastName: string
  role: string
  business: {
    name: string
  }
}

export default function StaffPayouts() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [staffData, setStaffData] = useState<StaffData | null>(null)
  const [stripeAccount, setStripeAccount] = useState<StripeAccount>({ isConnected: false, isVerified: false, requiresAction: false })
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    pendingPayouts: 0,
    commissionRate: 60
  })
  const [payouts, setPayouts] = useState<PayoutData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectingStripe, setConnectingStripe] = useState(false)
  const [refreshingAccount, setRefreshingAccount] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login')
      return
    }
    
    if (isLoaded && userId) {
      fetchStaffData()
      fetchStripeAccount()
      fetchEarnings()
      fetchPayouts()
    }
  }, [isLoaded, userId, router])

  // Handle URL parameters for Stripe Connect success/refresh
  useEffect(() => {
    const success = searchParams.get('success')
    const refresh = searchParams.get('refresh')
    
    if (success === 'true' || refresh === 'true') {
      console.log('Stripe Connect completed, refreshing account status...')
      setRefreshingAccount(true)
      
      // Clear URL parameters
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
      
      // Refresh Stripe account status after a short delay
      setTimeout(async () => {
        await fetchStripeAccount()
        await fetchEarnings()
        await fetchPayouts()
        setRefreshingAccount(false)
        setShowSuccessMessage(true)
        
        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccessMessage(false), 3000)
      }, 2000)
    }
  }, [searchParams])

  const fetchStaffData = async () => {
    try {
      const response = await fetch('/api/staff/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStaffData(data)
      } else {
        throw new Error('Failed to fetch staff data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const fetchStripeAccount = async () => {
    try {
      // Add cache-busting parameter to force fresh data
      const response = await fetch(`/api/staff/stripe-account?t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        setStripeAccount(data)
        console.log('Stripe account status updated:', data)
      } else {
        // Mock data for demo
        setStripeAccount({
          isConnected: false,
          isVerified: false,
          requiresAction: false
        })
      }
    } catch (err) {
      console.error('Failed to fetch Stripe account:', err)
    }
  }

  const fetchEarnings = async () => {
    try {
      const response = await fetch('/api/staff/earnings')
      if (response.ok) {
        const data = await response.json()
        setEarnings(data)
      } else {
        // Mock data for demo
        setEarnings({
          totalEarnings: 2450.00,
          thisMonthEarnings: 680.00,
          pendingPayouts: 125.50,
          lastPayoutDate: '2024-10-15',
          nextPayoutDate: '2024-11-01',
          commissionRate: 60
        })
      }
    } catch (err) {
      console.error('Failed to fetch earnings:', err)
    }
  }

  const fetchPayouts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/staff/payouts')
      
      if (response.ok) {
        const data = await response.json()
        setPayouts(data.payouts || [])
      } else {
        // Mock data for demo
        setPayouts([
          {
            id: '1',
            amount: 340.00,
            currency: 'GBP',
            status: 'paid',
            date: '2024-10-15',
            description: 'Weekly payout for Oct 8-14',
            stripePayoutId: 'po_1234567890'
          },
          {
            id: '2',
            amount: 280.50,
            currency: 'GBP',
            status: 'paid',
            date: '2024-10-08',
            description: 'Weekly payout for Oct 1-7',
            stripePayoutId: 'po_0987654321'
          },
          {
            id: '3',
            amount: 125.50,
            currency: 'GBP',
            status: 'pending',
            date: '2024-10-22',
            description: 'Weekly payout for Oct 15-21'
          }
        ])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const connectStripeAccount = async () => {
    try {
      setConnectingStripe(true)
      const response = await fetch('/api/staff/stripe-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.url) {
          window.location.href = data.url
        }
      } else {
        // Mock for demo - simulate connection
        setTimeout(() => {
          setStripeAccount({
            id: 'acct_mock123',
            isConnected: true,
            isVerified: false,
            requiresAction: true,
            actionUrl: 'https://connect.stripe.com/setup/s/mock123'
          })
          setConnectingStripe(false)
        }, 2000)
      }
    } catch (err) {
      setError('Failed to connect Stripe account')
      setConnectingStripe(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payouts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Refreshing indicator */}
      {refreshingAccount && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-800 font-medium">Updating account status...</p>
          </div>
        </div>
      )}

      {/* Success message */}
      {showSuccessMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">Account status updated successfully!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payouts & Earnings</h1>
          <p className="text-gray-600">
            Manage your earnings and payout settings
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setRefreshingAccount(true)
              fetchStripeAccount()
              fetchEarnings()
              fetchPayouts()
              setTimeout(() => setRefreshingAccount(false), 2000)
            }}
            disabled={refreshingAccount}
          >
            {refreshingAccount ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            ) : (
              <Settings className="w-4 h-4 mr-2" />
            )}
            {refreshingAccount ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stripe Connect Status */}
      {!stripeAccount.isConnected ? (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Connect Your Bank Account</h3>
                  <p className="text-blue-700 mb-4">
                    To receive payouts, you need to connect your bank account through Stripe Connect. 
                    This is secure and allows us to send your earnings directly to your account.
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Secure & encrypted</span>
                    <CheckCircle className="w-4 h-4 ml-4" />
                    <span>Fast payouts</span>
                    <CheckCircle className="w-4 h-4 ml-4" />
                    <span>No setup fees</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={connectStripeAccount}
                disabled={connectingStripe}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {connectingStripe ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect with Stripe
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : stripeAccount.requiresAction ? (
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">Complete Your Account Setup</h3>
                  <p className="text-yellow-700 mb-4">
                    Your Stripe account is connected but requires additional information to enable payouts.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => window.open(stripeAccount.actionUrl, '_blank')}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Complete Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Account Connected</h3>
                <p className="text-green-700">Your Stripe account is connected and ready to receive payouts.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">£{earnings.totalEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-glam-pink" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">£{earnings.thisMonthEarnings.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-bold text-gray-900">£{earnings.pendingPayouts.toFixed(2)}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Rate</p>
                <p className="text-2xl font-bold text-gray-900">{earnings.commissionRate}%</p>
              </div>
              <Banknote className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout Schedule */}
      {earnings.nextPayoutDate && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-glam-pink" />
              <span>Payout Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Last Payout</p>
                <p className="text-lg font-semibold text-gray-900">
                  {earnings.lastPayoutDate ? new Date(earnings.lastPayoutDate).toLocaleDateString() : 'No previous payouts'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Next Payout</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(earnings.nextPayoutDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payout History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Payout History</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payouts yet</h3>
              <p className="text-gray-600">Your payout history will appear here once you start receiving payments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        £{payout.amount.toFixed(2)} {payout.currency.toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600">{payout.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(payout.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(payout.status)}`}>
                      {getStatusIcon(payout.status)}
                      <span className="ml-1 capitalize">{payout.status}</span>
                    </span>
                    {payout.stripePayoutId && (
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
