'use client'

import { useAuth, useClerk } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Sparkles,
  Settings,
  Home,
  Bell,
  UserCircle,
  Search,
  Menu,
  X,
  Star,
  LogOut,
  UserPlus,
  CreditCard,
  Banknote,
  HelpCircle
} from 'lucide-react'

interface BusinessLayoutProps {
  children: React.ReactNode
}

export default function BusinessLayout({ children }: BusinessLayoutProps) {
  const { userId, isLoaded } = useAuth()
  const { signOut } = useClerk()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [loadingPlan, setLoadingPlan] = useState(true)

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login')
    }
  }, [isLoaded, userId, router])

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch('/api/business/plan-status')
        if (response.ok) {
          const data = await response.json()
          setCurrentPlan(data.plan || 'free')
        }
      } catch (error) {
        console.error('Failed to fetch plan:', error)
      } finally {
        setLoadingPlan(false)
      }
    }
    if (userId) {
      fetchPlan()
    }
  }, [userId])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!userId) {
    return null
  }

  const sidebarSections = [
    {
      title: 'Overview',
      items: [
        { icon: Home, label: 'Dashboard', href: '/business/dashboard' },
        { icon: Bell, label: 'Notifications', href: '/business/notifications' },
      ]
    },
    {
      title: 'Business',
      items: [
        { icon: Calendar, label: 'Calendar', href: '/business/calendar' },
        { icon: Users, label: 'Clients', href: '/business/clients' },
        { icon: UserPlus, label: 'Team', href: '/business/team' },
        { icon: Settings, label: 'Services', href: '/business/services' },
      ]
    },
    {
      title: 'Analytics & Finance',
      items: [
        { icon: BarChart3, label: 'Analytics', href: '/business/analytics' },
        { icon: Banknote, label: 'Payouts', href: '/business/payouts' },
      ]
    },
    {
      title: 'Admin',
      items: [
        { icon: CreditCard, label: 'Manage Plan', href: '/business/manage-plan' },
        { icon: HelpCircle, label: 'Support', href: '/business/support' },
        { icon: UserCircle, label: 'Profile', href: '/business/profile' },
      ]
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-glam-pink rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">GlamBooking</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-6">
            {sidebarSections.map((section) => (
              <div key={section.title}>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <button
                        key={item.label}
                        onClick={() => router.push(item.href)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-glam-pink text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          {!loadingPlan && currentPlan !== 'enterprise' && (
            <div className="bg-gradient-to-r from-glam-pink to-glam-gold rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {currentPlan === 'free' && 'Upgrade to Starter'}
                  {currentPlan === 'starter' && 'Upgrade to Professional'}
                  {currentPlan === 'professional' && 'Upgrade to Enterprise'}
                </span>
                <Star className="w-4 h-4" />
              </div>
              <p className="text-xs opacity-90 mb-3">
                {currentPlan === 'free' && 'Get up to 5 staff members and advanced features'}
                {currentPlan === 'starter' && 'Get up to 15 staff and premium analytics'}
                {currentPlan === 'professional' && 'Get unlimited staff and enterprise support'}
              </p>
              <Button 
                size="sm" 
                className="w-full bg-white text-glam-pink hover:bg-gray-100"
                onClick={() => router.push('/business/pricing')}
              >
                Manage Plan
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {pathname === '/business/dashboard' ? 'Dashboard' :
                   pathname === '/business/calendar' ? 'Calendar' :
                   pathname === '/business/clients' ? 'Clients' :
                   pathname === '/business/team' ? 'Team' :
                   pathname === '/business/services' ? 'Services' :
                   pathname === '/business/analytics' ? 'Analytics' :
                   pathname === '/business/payouts' ? 'Payouts' :
                   pathname === '/business/manage-plan' ? 'Manage Plan' :
                   pathname === '/business/notifications' ? 'Notifications' :
                   pathname === '/business/support' ? 'Support' :
                   pathname === '/business/profile' ? 'Profile' : 'Business'}
                </h1>
                <p className="text-sm text-gray-500">Manage your beauty business</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search here..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink focus:border-transparent"
                />
              </div>
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <UserCircle className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => signOut(() => router.push('/'))}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
