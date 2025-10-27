'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  Settings, 
  Star,
  ArrowRight,
  Mail,
  Phone,
  Building,
  UserCheck,
  Clock,
  Sparkles
} from 'lucide-react'

interface OnboardingData {
  invitation: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
    businessName: string
    businessId: string
  }
  staffRecord?: {
    id: string
    role: string
    isActive: boolean
  }
}

export default function StaffOnboarding() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

  const inviteToken = searchParams.get('invite')

  useEffect(() => {
    if (isLoaded && !userId) {
      // Redirect to signup with invitation token if not authenticated
      if (inviteToken) {
        router.push(`/signup?invite=${inviteToken}`)
      } else {
        router.push('/signup')
      }
      return
    }
    
    if (isLoaded && userId && inviteToken) {
      processOnboarding()
    } else if (isLoaded && userId && !inviteToken) {
      // No invitation token, redirect to staff dashboard
      router.push('/staff/dashboard')
    }
  }, [isLoaded, userId, router, inviteToken])

  const processOnboarding = async () => {
    try {
      setLoading(true)
      
      if (!inviteToken) {
        setError('No invitation token provided')
        return
      }

      // Decode invitation token
      const decoded = JSON.parse(Buffer.from(inviteToken, 'base64').toString())
      
      // Fetch invitation details
      const inviteResponse = await fetch(`/api/invitation/${decoded.invitationId}`)
      if (!inviteResponse.ok) {
        throw new Error('Invitation not found or expired')
      }
      
      const inviteData = await inviteResponse.json()
      
      // Check if staff record already exists
      const staffResponse = await fetch('/api/staff/dashboard')
      let staffRecord = null
      
      if (staffResponse.ok) {
        staffRecord = await staffResponse.json()
      }

      setOnboardingData({
        invitation: {
          id: decoded.invitationId,
          firstName: inviteData.firstName,
          lastName: inviteData.lastName,
          email: inviteData.email,
          role: inviteData.role,
          businessName: inviteData.businessName,
          businessId: decoded.businessId
        },
        staffRecord
      })

      // Auto-advance steps
      setTimeout(() => setCurrentStep(2), 1000)
      setTimeout(() => setCurrentStep(3), 2500)
      setTimeout(() => setCurrentStep(4), 4000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process onboarding')
    } finally {
      setLoading(false)
    }
  }

  const completeOnboarding = async () => {
    try {
      // Mark invitation as completed if needed
      await fetch(`/api/business/team/invitation/${onboardingData?.invitation.id}/complete`, {
        method: 'POST'
      })

      // Redirect to staff dashboard
      router.push('/staff/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Still redirect to dashboard even if completion fails
      router.push('/staff/dashboard')
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-glam-pink/10 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your staff account...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 text-center">Onboarding Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/')}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!onboardingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Processing...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">Setting up your account...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-glam-pink/10 to-purple-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step 
                    ? 'bg-glam-pink text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    step
                  )}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-glam-pink' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {currentStep === 1 && 'Verifying invitation...'}
                {currentStep === 2 && 'Creating your account...'}
                {currentStep === 3 && 'Setting up permissions...'}
                {currentStep === 4 && 'Ready to start!'}
              </p>
            </div>
          </div>
        </div>

        {/* Welcome Content */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-glam-pink to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to {onboardingData.invitation.businessName}!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hi {onboardingData.invitation.firstName}, your staff account has been successfully created! 
            You're now part of the team as a <span className="font-semibold text-glam-pink">{onboardingData.invitation.role}</span>.
          </p>
        </div>

        {/* Account Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <UserCheck className="w-6 h-6 mr-3 text-glam-pink" />
                Your Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-glam-pink/10 to-purple-100 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Staff Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-700">
                    <Mail className="w-4 h-4 mr-2 text-glam-pink" />
                    {onboardingData.invitation.email}
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Users className="w-4 h-4 mr-2 text-glam-pink" />
                    Role: {onboardingData.invitation.role}
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Building className="w-4 h-4 mr-2 text-glam-pink" />
                    {onboardingData.invitation.businessName}
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Account Active
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">What you can do:</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    View and manage your appointments
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Access client information
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Update your availability
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Track your performance
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Settings className="w-6 h-6 mr-3 text-glam-pink" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentStep >= 4 ? (
                <>
                  <Button 
                    onClick={completeOnboarding}
                    className="w-full bg-gradient-to-r from-glam-pink to-purple-600 hover:from-glam-pink/90 hover:to-purple-600/90 text-white"
                    size="lg"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Go to Your Dashboard
                  </Button>
                  
                  <div className="space-y-3 pt-4">
                    <h4 className="font-semibold text-gray-900">Recommended actions:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        Set your working hours and availability
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-green-500" />
                        Review your upcoming appointments
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Settings className="w-4 h-4 mr-2 text-purple-500" />
                        Complete your profile information
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Setting up your account...</p>
                  <div className="mt-4">
                    <div className="animate-pulse bg-gray-200 h-2 rounded-full"></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Tips */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Getting Started Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Check Your Schedule</h3>
                <p className="text-sm text-gray-600">
                  Review your upcoming appointments and set your availability preferences.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Meet Your Clients</h3>
                <p className="text-sm text-gray-600">
                  Familiarize yourself with client preferences and booking history.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Customize Settings</h3>
                <p className="text-sm text-gray-600">
                  Update your profile, notification preferences, and working hours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Need help? Contact your business administrator or check out our help center.
          </p>
        </div>
      </div>
    </div>
  )
}
