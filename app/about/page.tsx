import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Target, 
  Heart, 
  Sparkles,
  ArrowRight,
  Award,
  TrendingUp,
  Shield
} from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-glam-white via-white to-pink-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-glam-charcoal leading-tight">
                Empowering Beauty
                <span className="block glam-text-gradient">Professionals Worldwide</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                GlamBooking was born from a simple belief: every beauty professional deserves 
                the tools to run their business with confidence, elegance, and success.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="glam" className="text-lg px-8 py-4 shadow-xl">
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 border-glam-pink text-glam-pink hover:bg-glam-pink hover:text-white">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-glam-pink/5">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-glam-pink rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-glam-charcoal">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 text-base leading-relaxed">
                  To revolutionize how beauty professionals manage their businesses by providing 
                  intuitive, powerful, and affordable booking solutions that help them focus on 
                  what they do best - making people feel beautiful.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-glam-gold/5">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-glam-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-glam-charcoal">Our Values</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 text-base leading-relaxed">
                  We believe in empowerment, elegance, and excellence. Every feature we build 
                  is designed with love, tested with care, and delivered with the highest 
                  standards of quality and security.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-purple-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-glam-charcoal">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 text-base leading-relaxed">
                  To become the world's most trusted platform for beauty professionals, 
                  enabling millions of businesses to thrive and helping people discover 
                  and book amazing beauty experiences.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gradient-to-r from-glam-pink/5 to-glam-gold/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-glam-charcoal">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  GlamBooking started in 2023 when our founder, a former salon owner, 
                  experienced firsthand the challenges of managing appointments, payments, 
                  and client relationships with outdated tools.
                </p>
                <p>
                  After struggling with clunky booking systems and expensive solutions 
                  that didn't understand the beauty industry, she decided to build 
                  something better - a platform designed specifically for beauty professionals, 
                  by beauty professionals.
                </p>
                <p>
                  Today, GlamBooking serves thousands of salons, spas, and independent 
                  beauty professionals across the globe, helping them save time, 
                  increase revenue, and deliver exceptional client experiences.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold glam-text-gradient">10,000+</div>
                    <div className="text-sm text-gray-600 mt-1">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold glam-text-gradient">50+</div>
                    <div className="text-sm text-gray-600 mt-1">Countries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold glam-text-gradient">1M+</div>
                    <div className="text-sm text-gray-600 mt-1">Bookings Made</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold glam-text-gradient">99.9%</div>
                    <div className="text-sm text-gray-600 mt-1">Uptime</div>
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

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-glam-charcoal">
              Why Beauty Professionals Choose GlamBooking
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just another booking platform - we're your partner in success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-glam-charcoal">Industry Expertise</h3>
              <p className="text-gray-600">
                Built by beauty professionals who understand your unique challenges and needs.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-glam-charcoal">Proven Results</h3>
              <p className="text-gray-600">
                Our users see an average 40% increase in bookings within their first month.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-glam-charcoal">Bank-Level Security</h3>
              <p className="text-gray-600">
                Your data and payments are protected with enterprise-grade security measures.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-glam-pink rounded-2xl flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-glam-charcoal">24/7 Support</h3>
              <p className="text-gray-600">
                Our dedicated support team is always here to help you succeed.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-glam-gold rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-glam-charcoal">Constant Innovation</h3>
              <p className="text-gray-600">
                We're always adding new features based on your feedback and industry trends.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-glam-charcoal">Made with Love</h3>
              <p className="text-gray-600">
                Every pixel, every feature, every interaction is crafted with care and attention to detail.
              </p>
            </div>
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
                Ready to Join Our Community?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Become part of a growing community of successful beauty professionals 
                who trust GlamBooking to power their business.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="glam" className="text-lg px-8 py-4 shadow-xl">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-glam-charcoal">
                  View Pricing
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
