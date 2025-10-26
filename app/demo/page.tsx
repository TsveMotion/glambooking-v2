'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Building, Users, Scissors } from 'lucide-react'

export default function DemoPage() {
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const createDemoBusiness = async () => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/demo/create-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Glam Beauty Salon',
          description: 'Premium beauty salon offering hair, nails, and beauty treatments',
          address: '123 Beauty Street, London, UK',
          phone: '+44 20 1234 5678',
          email: 'hello@glambeautysalon.co.uk',
          website: 'https://glambeautysalon.co.uk',
          services: [
            { name: 'Hair Cut & Style', duration: 60, price: 45.00 },
            { name: 'Hair Color', duration: 120, price: 85.00 },
            { name: 'Manicure', duration: 45, price: 25.00 },
            { name: 'Pedicure', duration: 60, price: 35.00 },
            { name: 'Facial Treatment', duration: 75, price: 55.00 },
            { name: 'Eyebrow Threading', duration: 30, price: 15.00 }
          ],
          staff: [
            { name: 'Sarah Johnson', email: 'sarah@glambeautysalon.co.uk' }
          ]
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert('Demo business created successfully!')
        router.push(`/book/${data.business.id}`)
      } else {
        alert('Error creating demo business')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error creating demo business')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-glam-white via-white to-pink-50 p-4">
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 glam-gradient rounded-xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold glam-text-gradient">GlamBooking Demo</span>
          </div>
          <h1 className="text-4xl font-bold text-glam-charcoal mb-4">
            Test the Complete Booking System
          </h1>
          <p className="text-xl text-gray-600">
            Create a demo beauty salon and test the full customer booking experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-glam-pink/20">
            <CardHeader>
              <Building className="w-8 h-8 text-glam-pink mb-2" />
              <CardTitle>Demo Business</CardTitle>
              <CardDescription>
                Creates a fully functional beauty salon with services and staff
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-glam-gold/20">
            <CardHeader>
              <Scissors className="w-8 h-8 text-glam-gold mb-2" />
              <CardTitle>6 Services</CardTitle>
              <CardDescription>
                Hair cuts, coloring, manicures, pedicures, facials, and eyebrow threading
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-purple-500/20">
            <CardHeader>
              <Users className="w-8 h-8 text-purple-500 mb-2" />
              <CardTitle>Staff & Booking</CardTitle>
              <CardDescription>
                Professional staff member ready to accept real bookings
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Create Demo Salon</CardTitle>
            <CardDescription className="text-center">
              This will create a real business in the database that you can use to test bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={createDemoBusiness}
              disabled={isCreating}
              size="lg"
              variant="glam"
              className="text-lg px-8 py-4"
            >
              {isCreating ? 'Creating Demo Business...' : 'Create Demo Beauty Salon'}
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              This will redirect you to the booking page where you can test the customer experience
            </p>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Or test existing demo business:</p>
          <Button 
            onClick={() => router.push('/book/demo-business')}
            variant="outline"
            size="lg"
          >
            Visit Demo Booking Page
          </Button>
        </div>
      </div>
    </div>
  )
}
