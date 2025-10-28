import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Check, 
  Sparkles,
  ArrowRight,
  Star,
  Users,
  Zap,
  Crown,
  Building
} from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '£0',
      period: '/month',
      description: 'Perfect for solo practitioners just getting started',
      features: [
        '1 staff member only',
        'Unlimited bookings',
        'Basic analytics',
        'Email notifications',
        'Community support',
        'Custom booking page',
        '5% booking fee (includes Stripe fees)'
      ],
      popular: false,
      icon: Users,
      color: 'bg-green-500',
      highlight: 'Forever Free'
    },
    {
      name: 'Starter',
      price: '£19',
      period: '/month',
      description: 'Great for small salons with multiple staff',
      features: [
        'Up to 5 staff members',
        'Unlimited bookings',
        'Advanced analytics',
        'Email notifications',
        'Priority support',
        'Custom booking page',
        'Basic branding',
        '5% booking fee (includes Stripe fees)'
      ],
      popular: true,
      icon: Zap,
      color: 'bg-blue-500',
      highlight: 'Most Popular'
    },
    {
      name: 'Professional',
      price: '£39',
      period: '/month',
      description: 'Ideal for growing businesses with multiple locations',
      features: [
        'Up to 15 staff members',
        'Unlimited bookings',
        'Premium analytics',
        'Email & SMS notifications',
        'Priority support',
        'Full custom branding',
        'Marketing tools',
        'Multi-location support',
        '3% booking fee (includes Stripe fees)'
      ],
      popular: false,
      icon: Crown,
      color: 'bg-glam-pink',
      highlight: 'Best Value'
    },
    {
      name: 'Enterprise',
      price: '£79',
      period: '/month',
      description: 'For large salons and franchise businesses',
      features: [
        'Unlimited staff members',
        'Unlimited bookings',
        'Enterprise analytics',
        'Email & SMS notifications',
        'Dedicated support manager',
        'White-label branding',
        'Advanced marketing suite',
        'Multi-location support',
        'API access',
        'Custom integrations',
        '2% booking fee (includes Stripe fees)'
      ],
      popular: false,
      icon: Building,
      color: 'bg-glam-gold',
      highlight: 'Enterprise'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-glam-white via-white to-pink-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-glam-charcoal leading-tight">
                Simple, Transparent
                <span className="block glam-text-gradient">Pricing</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Start free forever or choose a paid plan to unlock more features. 
                All plans include our core booking system with no hidden fees.
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Start free forever</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon
              return (
                <Card 
                  key={plan.name}
                  className={`relative border-2 hover:shadow-2xl transition-all duration-300 ${
                    plan.popular 
                      ? 'border-glam-pink shadow-xl scale-105' 
                      : 'border-gray-200 hover:border-glam-pink/50'
                  }`}
                >
                  {(plan.popular || plan.highlight) && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className={`text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1 ${
                        plan.name === 'Free' ? 'bg-green-500' : 
                        plan.popular ? 'bg-glam-pink' : 'bg-glam-gold'
                      }`}>
                        <Star className="w-4 h-4 fill-current" />
                        <span>{plan.highlight}</span>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <div className={`w-16 h-16 ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-glam-charcoal">{plan.name}</CardTitle>
                    <CardDescription className="text-gray-600 mt-2">{plan.description}</CardDescription>
                    <div className="mt-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold text-glam-charcoal">{plan.price}</span>
                        <span className="text-xl text-gray-500 ml-1">{plan.period}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="pt-6">
                      <Link href={plan.name === 'Free' ? '/register' : `/checkout?plan=${plan.name.toLowerCase()}`}>
                        <Button 
                          className={`w-full text-lg py-3 ${
                            plan.popular 
                              ? 'glam-gradient text-white hover:opacity-90' 
                              : plan.name === 'Free'
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'border-2 border-glam-pink text-glam-pink hover:bg-glam-pink hover:text-white'
                          }`}
                          variant={plan.popular ? 'default' : 'outline'}
                        >
                          {plan.name === 'Free' ? 'Start Free' : 'Get Started'}
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-glam-charcoal">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our pricing and plans
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-glam-charcoal mb-3">
                What's included in the Free plan?
              </h3>
              <p className="text-gray-600">
                The Free plan includes 1 staff member, unlimited bookings, basic analytics, email notifications, 
                and community support. Perfect for solo practitioners to get started with no upfront costs.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-glam-charcoal mb-3">
                How do the booking fees work?
              </h3>
              <p className="text-gray-600">
                We charge simple, transparent booking fees based on your plan: Free (5%), Starter (5%), Professional (3%), 
                and Enterprise (2%). This fee includes all Stripe payment processing costs (~1.5%), so customers pay the service price only with no extra charges. 
                The remaining amount is automatically transferred to your connected bank account.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-glam-charcoal mb-3">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and we'll prorate any billing adjustments on your next invoice.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-glam-charcoal mb-3">
                Is there a setup fee?
              </h3>
              <p className="text-gray-600">
                No setup fees, ever. We believe in transparent pricing with no hidden costs. 
                You only pay your monthly subscription (if applicable) and the booking fee on successful transactions.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-glam-charcoal mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express) and bank transfers. 
                All payments are processed securely through Stripe.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-glam-charcoal mb-3">
                Do you offer discounts for annual billing?
              </h3>
              <p className="text-gray-600">
                Currently, we offer monthly billing only. However, we're working on annual plans 
                with significant discounts. Join our newsletter to be notified when they're available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-20 bg-gradient-to-r from-glam-pink/5 to-glam-gold/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-glam-charcoal rounded-2xl flex items-center justify-center mx-auto">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-glam-charcoal">
                Need Something Custom?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                For large enterprises, franchises, or businesses with unique requirements, 
                we offer custom solutions tailored to your specific needs.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-glam-pink rounded-xl flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-glam-charcoal">Dedicated Support</h3>
                <p className="text-gray-600 text-sm">Personal account manager and priority support</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-glam-gold rounded-xl flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-glam-charcoal">Custom Integrations</h3>
                <p className="text-gray-600 text-sm">API access and custom integrations with your existing systems</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-glam-charcoal">White Label</h3>
                <p className="text-gray-600 text-sm">Fully branded solution with your company's look and feel</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" variant="glam" className="text-lg px-8 py-4 shadow-xl">
                  Contact Sales
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 border-glam-pink text-glam-pink hover:bg-glam-pink hover:text-white">
                  Start Free Forever
                </Button>
              </Link>
            </div>
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
