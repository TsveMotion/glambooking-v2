'use client'

import { useUser } from '@clerk/nextjs'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar, 
  Users, 
  CreditCard, 
  BarChart3, 
  Sparkles, 
  Star,
  CheckCircle,
  ArrowRight,
  Scissors,
  Heart,
  Zap,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const ADMIN_EMAIL = 'kristiyan@tsvweb.com'

export default function HomePage() {
  const { user } = useUser()
  return (
    <div className="min-h-screen bg-gradient-to-br from-glam-white via-white to-pink-50">
      <Navigation />
      
      {/* Admin Button - Only visible to admin */}
      {user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL && (
        <div className="fixed top-20 right-4 z-50">
          <Link href="/admin">
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              size="sm"
            >
              <Shield className="w-4 h-4" />
              Admin Panel
            </Button>
          </Link>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-glam-pink/5 to-glam-gold/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-glam-charcoal leading-tight">
                  The Ultimate
                  <span className="block glam-text-gradient">Booking Platform</span>
                  for Beauty Professionals
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Transform your salon, spa, or beauty business with our elegant booking system. 
                  Manage appointments, clients, and payments seamlessly while you focus on what you do best.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/pricing">
                  <Button size="lg" variant="glam" className="text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 border-glam-pink text-glam-pink hover:bg-glam-pink hover:text-white">
                    View Pricing
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>24/7 support</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-glam-charcoal">Today's Schedule</h3>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-3 bg-glam-pink/5 rounded-lg">
                      <div className="w-10 h-10 bg-glam-pink rounded-full flex items-center justify-center">
                        <Scissors className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-glam-charcoal">Hair Cut & Style</p>
                        <p className="text-sm text-gray-500">Sarah Johnson • 10:00 AM</p>
                      </div>
                      <span className="text-glam-pink font-semibold">£45</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 bg-glam-gold/10 rounded-lg">
                      <div className="w-10 h-10 bg-glam-gold rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-glam-charcoal">Facial Treatment</p>
                        <p className="text-sm text-gray-500">Emma Wilson • 2:30 PM</p>
                      </div>
                      <span className="text-glam-gold font-semibold">£80</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-glam-charcoal">Manicure & Pedicure</p>
                        <p className="text-sm text-gray-500">Lisa Brown • 4:00 PM</p>
                      </div>
                      <span className="text-purple-500 font-semibold">£35</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Today's Revenue</span>
                      <span className="text-2xl font-bold glam-text-gradient">£160</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-glam-pink/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-glam-gold/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-glam-charcoal">
              Everything You Need to Run Your Beauty Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From appointment scheduling to payment processing, GlamBooking provides all the tools 
              you need to manage your business professionally and efficiently.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-glam-pink/5">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-glam-pink rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-glam-charcoal">Smart Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  Intelligent booking system that prevents double-bookings and optimizes your schedule automatically.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-glam-gold/5">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-glam-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-glam-charcoal">Client Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  Keep detailed client profiles, preferences, and history to provide personalized service every time.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-green-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-glam-charcoal">Secure Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  Accept payments online with Stripe. Get paid instantly with only 5% platform fee.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-purple-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-glam-charcoal">Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  Track your business performance with detailed analytics and automated financial reports.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gradient-to-r from-glam-pink/5 to-glam-gold/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-glam-charcoal">
              Trusted by Beauty Professionals Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of salons and beauticians who have transformed their business with GlamBooking
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-8">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-glam-gold text-glam-gold" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">
                  "GlamBooking has completely transformed how I run my salon. The booking system is so intuitive, 
                  and my clients love being able to book online 24/7."
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-glam-pink rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">SJ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-glam-charcoal">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Glamour Hair Studio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-8">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-glam-gold text-glam-gold" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">
                  "The payment integration is seamless, and I love getting paid instantly. 
                  The 5% fee is totally worth it for the convenience and professional look."
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-glam-gold rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">MW</span>
                  </div>
                  <div>
                    <p className="font-semibold text-glam-charcoal">Maria Williams</p>
                    <p className="text-sm text-gray-500">Bella Beauty Spa</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-8">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-glam-gold text-glam-gold" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">
                  "My revenue has increased by 40% since switching to GlamBooking. 
                  The analytics help me understand my business better than ever before."
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">LB</span>
                  </div>
                  <div>
                    <p className="font-semibold text-glam-charcoal">Lisa Brown</p>
                    <p className="text-sm text-gray-500">Luxe Nail Lounge</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-glam-charcoal text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-glam-pink/20 to-glam-gold/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-5xl font-bold">
                Ready to Transform Your Beauty Business?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Join thousands of beauty professionals who have already made the switch to GlamBooking. 
                Start your free trial today and see the difference.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing">
                <Button size="lg" variant="glam" className="text-lg px-8 py-4 shadow-xl hover:shadow-2xl">
                  Get Started
                  <Zap className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-glam-charcoal">
                  Contact Sales
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-gray-400">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 glam-gradient rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold glam-text-gradient">GlamBooking</span>
              </div>
              <p className="text-gray-600">
                The ultimate booking platform for beauty professionals worldwide.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-glam-charcoal mb-4">Product</h3>
              <div className="space-y-2">
                <Link href="/pricing" className="block text-gray-600 hover:text-glam-pink">Pricing</Link>
                <Link href="/features" className="block text-gray-600 hover:text-glam-pink">Features</Link>
                <Link href="/integrations" className="block text-gray-600 hover:text-glam-pink">Integrations</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-glam-charcoal mb-4">Company</h3>
              <div className="space-y-2">
                <Link href="/about" className="block text-gray-600 hover:text-glam-pink">About</Link>
                <Link href="/contact" className="block text-gray-600 hover:text-glam-pink">Contact</Link>
                <Link href="/careers" className="block text-gray-600 hover:text-glam-pink">Careers</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-glam-charcoal mb-4">Support</h3>
              <div className="space-y-2">
                <Link href="/help" className="block text-gray-600 hover:text-glam-pink">Help Center</Link>
                <Link href="/privacy" className="block text-gray-600 hover:text-glam-pink">Privacy Policy</Link>
                <Link href="/terms" className="block text-gray-600 hover:text-glam-pink">Terms of Service</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 mt-12 pt-8 text-center text-gray-600">
            <p>&copy; 2024 GlamBooking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
