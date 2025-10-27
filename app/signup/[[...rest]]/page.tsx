'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SignUp } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Mail, Users, Calendar } from 'lucide-react'

interface InvitationData {
  businessName: string
  role: string
  inviterName: string
  email: string
}

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const inviteToken = searchParams.get('invite')
  const email = searchParams.get('email')
  const role = searchParams.get('role')
  const businessName = searchParams.get('business')

  useEffect(() => {
    if (inviteToken) {
      // Decode invitation token
      try {
        const decoded = JSON.parse(Buffer.from(inviteToken, 'base64').toString())
        fetchInvitationDetails(decoded.invitationId)
      } catch (err) {
        setError('Invalid invitation link')
        setLoading(false)
      }
    } else if (email && role && businessName) {
      // Direct signup with URL parameters
      setInvitationData({
        businessName: decodeURIComponent(businessName),
        role: decodeURIComponent(role),
        inviterName: 'Team Administrator',
        email: decodeURIComponent(email)
      })
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [inviteToken, email, role, businessName])

  const fetchInvitationDetails = async (invitationId: string) => {
    try {
      const inviteResponse = await fetch(`/api/invitation/${invitationId}`)
      if (inviteResponse.ok) {
        const data = await inviteResponse.json()
        setInvitationData({
          businessName: data.businessName,
          role: data.role,
          inviterName: data.inviterName,
          email: data.email
        })
      } else {
        setError('Invitation not found or expired')
      }
    } catch (err) {
      setError('Failed to load invitation details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 text-center">Invalid Invitation</CardTitle>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Left side - Invitation Info */}
        {invitationData && (
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-glam-pink to-purple-600 p-12 text-white">
            <div className="flex flex-col justify-center max-w-md mx-auto">
              <div className="mb-8">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6">
                  <Mail className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-bold mb-4">You're Invited!</h1>
                <p className="text-xl opacity-90">
                  Join {invitationData.businessName} as a {invitationData.role}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <span>Access to business dashboard</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3" />
                  <span>Manage your schedule</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3" />
                  <span>Connect with clients</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <span>Track your performance</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white bg-opacity-10 rounded-lg">
                <p className="text-sm opacity-90">
                  <strong>Business:</strong> {invitationData.businessName}<br />
                  <strong>Role:</strong> {invitationData.role}<br />
                  <strong>Email:</strong> {invitationData.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Right side - Signup Form */}
        <div className={`flex-1 flex items-center justify-center p-8 ${invitationData ? 'lg:w-1/2' : 'w-full'}`}>
          <div className="w-full max-w-md">
            {invitationData && (
              <div className="mb-8 text-center lg:hidden">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Join {invitationData.businessName}</h2>
                <p className="text-gray-600">You've been invited as a {invitationData.role}</p>
              </div>
            )}

            <SignUp 
              routing="path"
              path="/signup"
              fallbackRedirectUrl={inviteToken ? `/staff/onboarding?invite=${inviteToken}` : "/business/dashboard"}
              initialValues={{
                emailAddress: invitationData?.email || ""
              }}
              appearance={{
                elements: {
                  formButtonPrimary: 
                    "bg-gradient-to-r from-glam-pink to-purple-600 hover:from-glam-pink/90 hover:to-purple-600/90",
                  card: "shadow-lg",
                  headerTitle: invitationData ? "Complete Your Account" : "Create Your Account",
                  headerSubtitle: invitationData 
                    ? `Join ${invitationData.businessName} as a ${invitationData.role}` 
                    : "Sign up to get started with GlamBooking"
                }
              }}
            />

            {invitationData && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> After signing up, you'll receive a welcome email with your dashboard access link.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
