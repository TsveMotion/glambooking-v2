'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Send
} from 'lucide-react'

export default function SupportPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    urgency: 'medium',
    category: 'general',
    message: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login')
      return
    }
  }, [isLoaded, userId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/business/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({
          subject: '',
          urgency: 'medium',
          category: 'general',
          message: '',
          email: '',
          phone: ''
        })
      } else {
        alert('Failed to submit support request. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting support request:', error)
      alert('Error submitting support request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'urgent': return 'text-red-800 bg-red-100 border-red-300'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (submitted) {
    return (
      <div className="p-6">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Support Request Submitted!</h2>
              <p className="text-green-700 mb-6">
                Thank you for contacting us. We've received your support request and will get back to you within 24 hours.
              </p>
              <div className="space-y-2 text-sm text-green-600">
                <p><strong>Reference ID:</strong> #{Date.now().toString().slice(-6)}</p>
                <p><strong>Expected Response:</strong> Within 24 hours</p>
              </div>
              <Button 
                onClick={() => setSubmitted(false)}
                className="mt-6 bg-green-600 hover:bg-green-700"
              >
                Submit Another Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Support</h1>
          <p className="text-gray-600">
            Get help with your GlamBooking account, billing, or technical issues
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Methods */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Phone className="w-5 h-5 mr-2" />
                  Phone Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Speak directly with our support team
                </p>
                <p className="font-semibold text-blue-600">+44 07444358808</p>
                <p className="text-xs text-red-600 font-medium mt-1">URGENT MATTERS ONLY!</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  Mon-Fri, 9AM-6PM GMT
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Send us a detailed message
                </p>
                <p className="font-semibold text-blue-600">support@glambooking.com</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  Response within 24 hours
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Support Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Support Request</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+44 20 1234 5678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="general">General Support</option>
                        <option value="billing">Billing & Payments</option>
                        <option value="technical">Technical Issues</option>
                        <option value="account">Account Management</option>
                        <option value="feature">Feature Request</option>
                        <option value="bug">Bug Report</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Urgency *
                      </label>
                      <select
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low - General inquiry</option>
                        <option value="medium">Medium - Standard support</option>
                        <option value="high">High - Business impacting</option>
                        <option value="urgent">Urgent - Critical issue</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Please provide as much detail as possible about your issue or question..."
                    />
                  </div>

                  {/* Urgency Preview */}
                  <div className={`p-3 rounded-lg border ${getUrgencyColor(formData.urgency)}`}>
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">
                        {formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)} Priority Request
                      </span>
                    </div>
                    <p className="text-xs mt-1">
                      {formData.urgency === 'urgent' && 'We will respond within 2 hours during business hours'}
                      {formData.urgency === 'high' && 'We will respond within 4 hours during business hours'}
                      {formData.urgency === 'medium' && 'We will respond within 24 hours'}
                      {formData.urgency === 'low' && 'We will respond within 48 hours'}
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Support Request
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
