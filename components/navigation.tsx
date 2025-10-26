'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Menu, X, LayoutDashboard, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth, SignOutButton } from '@clerk/nextjs'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isSignedIn, isLoaded } = useAuth()

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 glam-gradient rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold glam-text-gradient">GlamBooking</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-glam-pink transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-glam-pink transition-colors">
              About
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-glam-pink transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-glam-pink transition-colors">
              Contact
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoaded && isSignedIn ? (
              <>
                <Link href="/business/dashboard">
                  <Button variant="ghost" className="text-gray-700 hover:text-glam-pink">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <SignOutButton>
                  <Button variant="outline" className="text-gray-700 hover:text-red-600 border-gray-300">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </SignOutButton>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-glam-pink">
                    Sign In
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="glam" className="shadow-lg">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-glam-pink transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/about" 
                className="text-gray-700 hover:text-glam-pink transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-700 hover:text-glam-pink transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-700 hover:text-glam-pink transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                {isLoaded && isSignedIn ? (
                  <>
                    <Link href="/business/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <SignOutButton>
                      <Button variant="outline" className="w-full justify-start text-gray-700 hover:text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </SignOutButton>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/pricing" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="glam" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
