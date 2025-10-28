'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Search, 
  Star, 
  Clock, 
  Phone, 
  Mail,
  Building2,
  Navigation as NavigationIcon
} from 'lucide-react'
import Link from 'next/link'

export default function DiscoverPage() {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

  useEffect(() => {
    fetchBusinesses()
    getUserLocation()
  }, [])

  useEffect(() => {
    filterBusinesses()
  }, [searchTerm, location, businesses])

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/discover/businesses')
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data.businesses || [])
        setFilteredBusinesses(data.businesses || [])
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied')
        }
      )
    }
  }

  const filterBusinesses = () => {
    let filtered = businesses

    if (searchTerm) {
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (location) {
      filtered = filtered.filter(business =>
        business.address?.toLowerCase().includes(location.toLowerCase())
      )
    }

    setFilteredBusinesses(filtered)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Discover Beauty Businesses
          </h1>
          <p className="text-lg text-gray-600">
            Find and book appointments with top-rated beauty professionals near you
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search businesses, services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Location or postcode..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {userLocation && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                <NavigationIcon className="w-4 h-4" />
                <span>Using your current location</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading businesses...</p>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No businesses found</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map((business) => (
                <Card 
                  key={business.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Business Header */}
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {business.name}
                          </h3>
                          {business.isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Open
                            </span>
                          )}
                        </div>
                        {business.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {business.description}
                          </p>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">4.9</span>
                        </div>
                        {business.serviceCount > 0 && (
                          <span>• {business.serviceCount} services</span>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 text-sm">
                        {business.address && (
                          <div className="flex items-start gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{business.address}</span>
                          </div>
                        )}
                        {business.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{business.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <Link href={`/book/${business.id}`}>
                        <Button 
                          className="w-full"
                          style={{
                            background: 'linear-gradient(to right, #E91E63, #9C27B0)'
                          }}
                        >
                          Book Appointment
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
