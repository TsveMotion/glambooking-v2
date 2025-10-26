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
      const response = await fetch(`/api/business/team/invitation/${invitationId}`)
      if (response.ok) {
        const data = await response.json()
        setInvitationData(data.invitation)
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
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invitation Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/')} variant="outline">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        {/* Invitation Details */}
        {invitationData && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-glam-pink rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900">You're Invited!</CardTitle>
              <p className="text-gray-600">Join {invitationData.businessName} as a team member</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Invitation Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-blue-800">
                    <Mail className="w-4 h-4 mr-2" />
                    Email: {invitationData.email}
                  </div>
                  <div className="flex items-center text-blue-800">
                    <Users className="w-4 h-4 mr-2" />
                    Role: {invitationData.role}
                  </div>
                  <div className="flex items-center text-blue-800">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Business: {invitationData.businessName}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">What you'll get access to:</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Professional dashboard for managing your work
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Calendar integration for appointments
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Client management tools
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Real-time notifications and updates
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-amber-800 text-sm">
                  <strong>Note:</strong> After creating your account, you'll receive a welcome email with your dashboard access link.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clerk SignUp Component */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <SignUp 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-lg border-0",
                  headerTitle: "text-2xl font-bold text-gray-900",
                  headerSubtitle: "text-gray-600",
                  socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50",
                  formButtonPrimary: "bg-glam-pink hover:bg-glam-pink/90",
                  footerActionLink: "text-glam-pink hover:text-glam-pink/90"
                }
              }}
              redirectUrl={invitationData ? "/staff/welcome" : "/business/dashboard"}
              initialValues={{
                emailAddress: invitationData?.email || email || ""
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
