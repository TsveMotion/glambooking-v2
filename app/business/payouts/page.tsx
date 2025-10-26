'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PlanGuard from '@/components/plan-guard'
import { 
  Banknote, 
  TrendingUp, 
  Download, 
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Building2,
  Plus,
  Settings,
  ExternalLink,
  Shield,
  X,
  Users,
  Edit,
  DollarSign
} from 'lucide-react'

interface PayoutData {
  availableBalance: number
  pendingBalance: number
  totalEarnings: number
  platformFees: number
  payoutHistory: PayoutTransaction[]
  nextPayoutDate: string
  stripeConnected: boolean
  bankAccount?: BankAccount
  stripeAccountId?: string
}

interface PayoutTransaction {
  id: string
  amount: number
  status: 'COMPLETED' | 'PENDING' | 'FAILED'
  date: string
  description: string
  stripeTransferId?: string
}

interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  routingNumber: string
  currency: string
  status: 'verified' | 'pending' | 'failed'
}

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  payoutSettings: {
    type: 'percentage_own' | 'percentage_total' | 'weekly_fixed' | 'daily_fixed'
    value: number
  }
  totalEarnings: number
  thisWeekEarnings: number
}

function PayoutsPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [payoutData, setPayoutData] = useState<PayoutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [requestingPayout, setRequestingPayout] = useState(false)
  const [connectingStripe, setConnectingStripe] = useState(false)
  const [showAddBankModal, setShowAddBankModal] = useState(false)
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    routingNumber: '',
    accountHolderName: ''
  })
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [stripeConnected, setStripeConnected] = useState(false)

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login')
      return
    }
    
    if (isLoaded && userId) {
      fetchPayoutData()
    }
  }, [isLoaded, userId, router])

  const fetchPayoutData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/business/payouts')
      
      if (response.ok) {
        const data = await response.json()
        setPayoutData(data)
        setStripeConnected(data.stripeConnected || false)
      }

      // Fetch team members
      const teamResponse = await fetch('/api/business/team')
      if (teamResponse.ok) {
        const teamData = await teamResponse.json()
        setTeamMembers(teamData.business?.teamMembers || [])
      }
    } catch (error) {
      console.error('Error fetching payout data:', error)
    } finally {
      setLoading(false)
    }
  }

  const requestPayout = async () => {
    if (!payoutData || payoutData.availableBalance <= 0) return
    
    try {
      setRequestingPayout(true)
      const response = await fetch('/api/business/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        await fetchPayoutData()
        alert('Payout request submitted successfully!')
      } else {
        throw new Error('Failed to request payout')
      }
    } catch (error) {
      console.error('Error requesting payout:', error)
      alert('Error requesting payout. Please try again.')
    } finally {
      setRequestingPayout(false)
    }
  }

  const connectStripe = async () => {
    setConnectingStripe(true)
    try {
      const response = await fetch('/api/business/stripe-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const { accountLinkUrl } = await response.json()
        window.location.href = accountLinkUrl
      } else {
        alert('Failed to connect Stripe account')
      }
    } catch (error) {
      alert('Error connecting Stripe')
    } finally {
      setConnectingStripe(false)
    }
  }

  // Check URL params for connection success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('connected') === 'true') {
      setStripeConnected(true)
      // Remove the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const addBankAccount = async () => {
    if (!bankDetails.accountNumber || !bankDetails.routingNumber || !bankDetails.accountHolderName) {
      alert('Please fill in all bank account details')
      return
    }

    try {
      const response = await fetch('/api/business/bank-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankDetails)
      })
      
      if (response.ok) {
        setShowAddBankModal(false)
        setBankDetails({ accountNumber: '', routingNumber: '', accountHolderName: '' })
        await fetchPayoutData()
        alert('Bank account added successfully!')
      } else {
        throw new Error('Failed to add bank account')
      }
    } catch (error) {
      console.error('Error adding bank account:', error)
      alert('Error adding bank account. Please try again.')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'FAILED':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payouts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payouts & Earnings</h1>
          <p className="text-gray-600">Manage your earnings and bank account for receiving payments</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stripe Connect Setup */}
      {!stripeConnected ? (
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-800">Connect Your Stripe Account</h3>
                  <p className="text-orange-700">
                    Connect your Stripe account to receive payouts and manage your bank account details.
                  </p>
                </div>
              </div>
              <Button 
                onClick={connectStripe}
                disabled={connectingStripe}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {connectingStripe ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </div>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect Stripe
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stripe Connected Status */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Stripe Account Connected</h3>
                    <p className="text-green-700">
                      Your Stripe account is connected and ready to receive payouts.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available Balance</p>
                    <p className="text-3xl font-bold text-green-600">£{payoutData?.availableBalance?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-gray-500 mt-1">Ready for payout</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Banknote className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Balance</p>
                    <p className="text-3xl font-bold text-gray-900">£{payoutData?.pendingBalance?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-gray-500 mt-1">Processing</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-3xl font-bold text-gray-900">£{payoutData?.totalEarnings?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Platform Fees</p>
                    <p className="text-3xl font-bold text-gray-900">£{payoutData?.platformFees?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-gray-500 mt-1">5% of earnings</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bank Account & Payout Management */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Bank Account
                </CardTitle>
                <CardDescription>
                  Manage your bank account for receiving payouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payoutData?.bankAccount ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {payoutData.bankAccount.bankName}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          payoutData.bankAccount.status === 'verified' 
                            ? 'bg-green-100 text-green-800'
                            : payoutData.bankAccount.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {payoutData.bankAccount.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        ****{payoutData.bankAccount.accountNumber.slice(-4)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {payoutData.bankAccount.currency.toUpperCase()}
                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Update Bank Account
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No bank account connected</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Connect your Stripe account first to add bank account details
                    </p>
                    <Button 
                      onClick={() => setShowAddBankModal(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Bank Account
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Banknote className="w-5 h-5 mr-2" />
                  Request Payout
                </CardTitle>
                <CardDescription>
                  Transfer available funds to your bank account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Available Amount</span>
                      <span className="text-lg font-bold text-green-600">
                        £{payoutData?.availableBalance?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Processing Time</span>
                      <span className="text-gray-700">1-2 business days</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={requestPayout}
                    disabled={(payoutData?.availableBalance || 0) <= 0 || requestingPayout || !payoutData?.bankAccount}
                  >
                    {requestingPayout ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        Request Payout
                      </>
                    )}
                  </Button>
                  
                  {(payoutData?.availableBalance || 0) <= 0 && (
                    <p className="text-sm text-gray-500 text-center">
                      No funds available for payout
                    </p>
                  )}
                  {!payoutData?.bankAccount && (
                    <p className="text-sm text-red-500 text-center">
                      Add a bank account to request payouts
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Payout Allocation */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Team Payout Allocation
                  </CardTitle>
                  <CardDescription>
                    Manage how earnings are distributed among team members
                  </CardDescription>
                </div>
                <Button onClick={() => setShowTeamModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {teamMembers.length > 0 ? (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {member.payoutSettings.type === 'percentage_own' && `${member.payoutSettings.value}% of own bookings`}
                            {member.payoutSettings.type === 'percentage_total' && `${member.payoutSettings.value}% of total revenue`}
                            {member.payoutSettings.type === 'weekly_fixed' && `£${member.payoutSettings.value}/week`}
                            {member.payoutSettings.type === 'daily_fixed' && `£${member.payoutSettings.value}/day`}
                          </p>
                          <p className="text-xs text-gray-500">
                            This week: £{member.thisWeekEarnings.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingMember(member)
                            setShowTeamModal(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No team members added yet</p>
                  <p className="text-sm text-gray-400">
                    Add team members to manage payout allocations
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payout History */}
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>
                Your recent payout transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payoutData?.payoutHistory && payoutData.payoutHistory.length > 0 ? (
                <div className="space-y-4">
                  {payoutData.payoutHistory.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          {getStatusIcon(transaction.status)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          £{transaction.amount.toFixed(2)}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Banknote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No payout history yet</p>
                  <p className="text-sm text-gray-400">
                    Your payout transactions will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Team Member Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                </h3>
                <button
                  onClick={() => {
                    setShowTeamModal(false)
                    setEditingMember(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John"
                      defaultValue={editingMember?.firstName || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Doe"
                      defaultValue={editingMember?.lastName || ''}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                    defaultValue={editingMember?.email || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="stylist">Stylist</option>
                    <option value="manager">Manager</option>
                    <option value="assistant">Assistant</option>
                    <option value="receptionist">Receptionist</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payout Type *
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="percentage_own">Percentage of Own Bookings</option>
                    <option value="percentage_total">Percentage of Total Business Revenue</option>
                    <option value="weekly_fixed">Fixed Weekly Amount</option>
                    <option value="daily_fixed">Fixed Daily Amount</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount/Percentage *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="50"
                      min="0"
                      max="100"
                      step="0.1"
                      defaultValue={editingMember?.payoutSettings.value || ''}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    For percentages: 0-100%. For fixed amounts: £ per period.
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTeamModal(false)
                    setEditingMember(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Handle save logic here
                    setShowTeamModal(false)
                    setEditingMember(null)
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {editingMember ? 'Update Member' : 'Add Member'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bank Account Modal */}
      {showAddBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Bank Account</h3>
                <button
                  onClick={() => setShowAddBankModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountHolderName}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolderName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Code *
                  </label>
                  <input
                    type="text"
                    value={bankDetails.routingNumber}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, routingNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12-34-56"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAddBankModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addBankAccount}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Add Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProtectedPayouts() {
  return (
    <PlanGuard fallbackMessage="Access to payouts and earnings requires an active subscription plan.">
      <PayoutsPage />
    </PlanGuard>
  )
}
