'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Check,
  Star,
  Users,
  Calendar,
  CreditCard,
  AlertTriangle,
  Crown,
  ArrowUp,
  CheckCircle2,
  X,
  Settings,
  Download
} from 'lucide-react'

interface PlanDetails {
  id: string
  name: string
  price: number
  maxStaff: number
  nextBillingDate: string
  status: 'active' | 'cancelled' | 'past_due'
  subscriptionId: string
}

export default function ManagePlanPage() {
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<PlanDetails | null>(null)
  const [businessData, setBusinessData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [reactivateLoading, setReactivateLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    fetchPlanData()
  }, [])

  const fetchPlanData = async () => {
    try {
      const response = await fetch('/api/business/plan-details')
      if (response.ok) {
        const data = await response.json()
        setCurrentPlan(data.plan)
        setBusinessData(data.business)
      }
    } catch (error) {
      console.error('Failed to fetch plan data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelPlan = async () => {
    setCancelLoading(true)
    try {
      const response = await fetch('/api/business/cancel-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason })
      })

      if (response.ok) {
        setShowCancelModal(false)
        fetchPlanData() // Refresh data
        alert('Your plan has been cancelled. You\'ll retain access until the end of your billing period.')
      } else {
        alert('Failed to cancel plan. Please contact support.')
      }
    } catch (error) {
      alert('Failed to cancel plan. Please contact support.')
    } finally {
      setCancelLoading(false)
    }
  }

  const handleReactivatePlan = async () => {
    setReactivateLoading(true)
    try {
      const response = await fetch('/api/business/reactivate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        fetchPlanData() // Refresh data
        alert('Your plan has been reactivated successfully!')
      } else {
        alert('Failed to reactivate plan. Please contact support.')
      }
    } catch (error) {
      alert('Failed to reactivate plan. Please contact support.')
    } finally {
      setReactivateLoading(false)
    }
  }

  const handleDownloadInvoice = async () => {
    try {
      const invoiceId = 'inv_' + Date.now() // Mock invoice ID
      const response = await fetch(`/api/business/invoice-download?invoiceId=${invoiceId}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${invoiceId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to download invoice. Please try again.')
      }
    } catch (error) {
      console.error('Error downloading invoice:', error)
      alert('Failed to download invoice. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getPlanFeatures = (planId: string) => {
    const features = {
      starter: [
        'Up to 3 staff members',
        'Unlimited bookings',
        'Basic analytics',
        'Email notifications',
        'Standard support',
        'Custom booking page'
      ],
      professional: [
        'Up to 10 staff members',
        'Unlimited bookings',
        'Advanced analytics',
        'Email & SMS notifications',
        'Priority support',
        'Custom branding',
        'Marketing tools'
      ],
      enterprise: [
        'Unlimited staff members',
        'Premium analytics',
        'Email & SMS notifications',
        'Dedicated support',
        'Custom branding',
        'Marketing tools',
        'Multi-location support',
        'API access'
      ]
    }
    return features[planId as keyof typeof features] || []
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your plan details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Plan</h1>
          <p className="text-gray-600">View and manage your subscription details</p>
        </div>
        <Button 
          onClick={() => router.push('/business/pricing')}
          className="bg-glam-pink hover:bg-glam-pink/90"
        >
          <ArrowUp className="w-4 h-4 mr-2" />
          Upgrade Plan
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Current Plan Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Plan</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentPlan?.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : currentPlan?.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {currentPlan?.status === 'active' ? 'Active' : 
                   currentPlan?.status === 'cancelled' ? 'Cancelled' : 'Past Due'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-glam-pink to-glam-gold rounded-full flex items-center justify-center">
                    {currentPlan?.id === 'enterprise' ? (
                      <Crown className="w-8 h-8 text-white" />
                    ) : (
                      <Star className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {currentPlan?.name === 'Starter' ? 'User' : currentPlan?.name} Plan
                    </h3>
                    <p className="text-gray-600">
                      £{currentPlan?.price}/month • {currentPlan?.maxStaff === -1 ? 'Unlimited' : `Up to ${currentPlan?.maxStaff}`} team members
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-glam-pink">
                    £{currentPlan?.price}
                  </p>
                  <p className="text-sm text-gray-500">per month</p>
                </div>
              </div>

              {/* Plan Features */}
              <div className="grid md:grid-cols-2 gap-4">
                {getPlanFeatures(currentPlan?.id || '').map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Next Billing Date</h4>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {currentPlan?.nextBillingDate ? formatDate(currentPlan.nextBillingDate) : 'N/A'}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Amount</h4>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">£{currentPlan?.price}/month</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Payment Method</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      VISA
                    </div>
                    <span className="text-gray-700">•••• •••• •••• 4242</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Transaction Fee</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-700">5% per booking</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subscription ID:</span>
                  <span className="text-sm font-mono text-gray-500">
                    {currentPlan?.subscriptionId || 'sub_1234567890'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Current Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-glam-pink">
                    {(businessData?.business?.staff?.length || 0) + 1}
                  </div>
                  <div className="text-sm text-gray-600">
                    Team Members
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    of {currentPlan?.maxStaff === -1 ? '∞' : currentPlan?.maxStaff} allowed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    0
                  </div>
                  <div className="text-sm text-gray-600">
                    Bookings This Month
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Unlimited
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    £{businessData?.metrics?.monthlyRevenue || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Revenue This Month
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    5% platform fee
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => router.push('/business/pricing')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open('https://billing.stripe.com/p/login/test_123', '_blank')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Update Payment Method
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleDownloadInvoice}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Invoices
              </Button>
              <Button 
                variant="outline" 
                className="w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                onClick={() => router.push('/business/payouts')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Payouts
              </Button>
            </CardContent>
          </Card>

          {/* Cancel/Reactivate Plan */}
          {currentPlan?.status === 'active' && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Cancel Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Cancel your subscription. You'll retain access until the end of your current billing period.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel Subscription
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Reactivate Plan */}
          {currentPlan?.status === 'cancelled' && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-600 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Plan Cancelled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-2 font-medium">
                  Your plan has been cancelled.
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  You'll lose access on {currentPlan?.nextBillingDate ? formatDate(currentPlan.nextBillingDate) : 'your next billing date'}. 
                  Click below to reactivate your subscription.
                </p>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleReactivatePlan}
                  disabled={reactivateLoading}
                >
                  {reactivateLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Reactivating...
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Reactivate Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Support */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Our support team is here to help with any questions about your plan.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/business/support')}
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-600">Cancel Subscription</h3>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-700 text-center mb-4">
                  Are you sure you want to cancel your subscription? You'll lose access to all premium features at the end of your billing period.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why are you cancelling? (Optional)
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select a reason...</option>
                    <option value="too_expensive">Too expensive</option>
                    <option value="not_using">Not using enough</option>
                    <option value="missing_features">Missing features</option>
                    <option value="switching_service">Switching to another service</option>
                    <option value="business_closing">Business closing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1"
                  disabled={cancelLoading}
                >
                  Keep Plan
                </Button>
                <Button
                  onClick={handleCancelPlan}
                  disabled={cancelLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {cancelLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Cancelling...
                    </div>
                  ) : (
                    'Cancel Plan'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
