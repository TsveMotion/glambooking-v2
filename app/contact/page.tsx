import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Sparkles,
  Send,
  MessageCircle,
  Users,
  Headphones
} from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-glam-white via-white to-pink-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-glam-charcoal leading-tight">
                Get in Touch
                <span className="block glam-text-gradient">We're Here to Help</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Have questions about GlamBooking? Need help getting started? 
                Our friendly team is ready to assist you every step of the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-glam-charcoal">Send us a Message</h2>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </div>
              
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium text-glam-charcoal">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-glam-pink focus:outline-none transition-colors"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium text-glam-charcoal">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-glam-pink focus:outline-none transition-colors"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-glam-charcoal">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-glam-pink focus:outline-none transition-colors"
                        placeholder="Enter your email address"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="businessName" className="text-sm font-medium text-glam-charcoal">
                        Business Name (Optional)
                      </label>
                      <input
                        type="text"
                        id="businessName"
                        name="businessName"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-glam-pink focus:outline-none transition-colors"
                        placeholder="Enter your business name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-glam-charcoal">
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-glam-pink focus:outline-none transition-colors"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="sales">Sales Question</option>
                        <option value="support">Technical Support</option>
                        <option value="billing">Billing Question</option>
                        <option value="partnership">Partnership Opportunity</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-glam-charcoal">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-glam-pink focus:outline-none transition-colors resize-none"
                        placeholder="Tell us how we can help you..."
                      ></textarea>
                    </div>
                    
                    <Button className="w-full glam-gradient text-white text-lg py-3 hover:opacity-90">
                      Send Message
                      <Send className="ml-2 w-5 h-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-glam-charcoal">Other Ways to Reach Us</h2>
                <p className="text-gray-600">
                  Choose the method that works best for you. We're available across multiple channels.
                </p>
              </div>
              
              <div className="space-y-6">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-glam-pink rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-glam-charcoal mb-2">Email Support</h3>
                        <p className="text-gray-600 mb-3">
                          Get detailed help via email. Perfect for complex questions or when you need documentation.
                        </p>
                        <a href="mailto:support@glambooking.co.uk" className="text-glam-pink hover:text-glam-pink/80 font-medium">
                          support@glambooking.co.uk
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-glam-gold rounded-xl flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-glam-charcoal mb-2">Live Chat</h3>
                        <p className="text-gray-600 mb-3">
                          Get instant answers to your questions. Available during business hours for immediate assistance.
                        </p>
                        <Button variant="outline" className="border-glam-gold text-glam-gold hover:bg-glam-gold hover:text-white">
                          Start Live Chat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-glam-charcoal mb-2">Phone Support</h3>
                        <p className="text-gray-600 mb-3">
                          Speak directly with our support team. Available for urgent issues and personalized assistance.
                        </p>
                        <a href="tel:+441234567890" className="text-green-500 hover:text-green-600 font-medium">
                          +44 (0) 123 456 7890
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-glam-charcoal mb-2">Community Forum</h3>
                        <p className="text-gray-600 mb-3">
                          Connect with other GlamBooking users, share tips, and get community support.
                        </p>
                        <Button variant="outline" className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white">
                          Join Community
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Hours & Location */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-glam-pink rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-glam-charcoal">Business Hours</CardTitle>
                <CardDescription>When our support team is available</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-glam-charcoal">Monday - Friday</span>
                  <span className="text-gray-600">9:00 AM - 6:00 PM GMT</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-glam-charcoal">Saturday</span>
                  <span className="text-gray-600">10:00 AM - 4:00 PM GMT</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-glam-charcoal">Sunday</span>
                  <span className="text-gray-600">Closed</span>
                </div>
                <div className="mt-6 p-4 bg-glam-pink/5 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Email support is available 24/7. We'll respond to all emails within 24 hours, 
                    even outside business hours.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-glam-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-glam-charcoal">Our Location</CardTitle>
                <CardDescription>Where we're based</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="font-medium text-glam-charcoal">GlamBooking Ltd.</p>
                  <p className="text-gray-600">123 Beauty Street</p>
                  <p className="text-gray-600">London, SW1A 1AA</p>
                  <p className="text-gray-600">United Kingdom</p>
                </div>
                <div className="mt-6 p-4 bg-glam-gold/5 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Remote-First:</strong> While we're based in London, our team works remotely 
                    to provide you with round-the-clock support and faster response times.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-r from-glam-pink/5 to-glam-gold/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-glam-charcoal">
              Quick Answers
            </h2>
            <p className="text-xl text-gray-600">
              Common questions we receive from our users
            </p>
          </div>
          
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-glam-charcoal mb-3">
                  How quickly will I get a response?
                </h3>
                <p className="text-gray-600">
                  We aim to respond to all inquiries within 24 hours. For urgent technical issues, 
                  we typically respond within 2-4 hours during business hours.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-glam-charcoal mb-3">
                  Do you offer phone support for all plans?
                </h3>
                <p className="text-gray-600">
                  Phone support is available for Professional and Enterprise plan subscribers. 
                  Starter plan users have access to email and live chat support.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-glam-charcoal mb-3">
                  Can you help me migrate from another booking system?
                </h3>
                <p className="text-gray-600">
                  Absolutely! Our team provides free migration assistance to help you transfer 
                  your client data and booking history from most popular booking platforms.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-glam-charcoal mb-3">
                  Do you offer training for new users?
                </h3>
                <p className="text-gray-600">
                  Yes! We provide comprehensive onboarding sessions, video tutorials, and 
                  personalized training calls to help you get the most out of GlamBooking.
                </p>
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
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Don't wait! Start your free trial today and see why thousands of beauty 
                professionals choose GlamBooking to grow their business.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="glam" className="text-lg px-8 py-4 shadow-xl">
                  Start Free Trial
                  <Sparkles className="ml-2 w-5 h-5" />
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
