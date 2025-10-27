'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users,
  User,
  Phone,
  Mail,
  Calendar,
  Star,
  Search,
  Filter,
  Plus,
  MessageCircle,
  History,
  TrendingUp
} from 'lucide-react'

interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  totalBookings: number
  totalSpent: number
  lastVisit?: string
  nextAppointment?: string
  favoriteServices: string[]
  notes?: string
  rating: number
  status: 'active' | 'inactive'
  joinDate: string
}

interface StaffData {
  id: string
  firstName: string
  lastName: string
  role: string
  business: {
    name: string
  }
}

export default function StaffClients() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [staffData, setStaffData] = useState<StaffData | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login')
      return
    }
    
    if (isLoaded && userId) {
      fetchStaffData()
      fetchClients()
    }
  }, [isLoaded, userId, router])

  const fetchStaffData = async () => {
    try {
      const response = await fetch('/api/staff/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStaffData(data)
      } else {
        throw new Error('Failed to fetch staff data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/staff/clients')
      
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      } else {
        // Mock data for now
        setClients([
          {
            id: '1',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah@example.com',
            phone: '+44 123 456 7890',
            totalBookings: 12,
            totalSpent: 540.00,
            lastVisit: '2024-10-20',
            nextAppointment: '2024-11-05',
            favoriteServices: ['Hair Cut & Style', 'Color Treatment'],
            notes: 'Prefers shorter layers, allergic to certain dyes',
            rating: 5,
            status: 'active',
            joinDate: '2024-01-15'
          },
          {
            id: '2',
            firstName: 'Emma',
            lastName: 'Wilson',
            email: 'emma@example.com',
            phone: '+44 987 654 3210',
            totalBookings: 8,
            totalSpent: 320.00,
            lastVisit: '2024-10-18',
            favoriteServices: ['Manicure', 'Pedicure'],
            rating: 4,
            status: 'active',
            joinDate: '2024-03-10'
          },
          {
            id: '3',
            firstName: 'Lisa',
            lastName: 'Brown',
            email: 'lisa@example.com',
            totalBookings: 15,
            totalSpent: 675.00,
            lastVisit: '2024-09-30',
            favoriteServices: ['Facial', 'Massage'],
            notes: 'VIP client, very loyal',
            rating: 5,
            status: 'active',
            joinDate: '2023-11-20'
          },
          {
            id: '4',
            firstName: 'Rachel',
            lastName: 'Davis',
            email: 'rachel@example.com',
            totalBookings: 3,
            totalSpent: 135.00,
            lastVisit: '2024-08-15',
            favoriteServices: ['Hair Cut'],
            rating: 3,
            status: 'inactive',
            joinDate: '2024-07-05'
          }
        ])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === '' || 
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Clients</h1>
          <p className="text-gray-600">
            Manage your client relationships and history
          </p>
        </div>
        <Button className="bg-glam-pink hover:bg-glam-pink/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
              <Users className="w-8 h-8 text-glam-pink" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => c.status === 'active').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  £{clients.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(clients.reduce((sum, c) => sum + c.rating, 0) / clients.length).toFixed(1)}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-400 fill-current" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink"
              >
                <option value="all">All Clients</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start building your client base'}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-glam-pink rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {client.firstName} {client.lastName}
                      </h3>
                      <div className="flex items-center space-x-1 mt-1">
                        {renderStars(client.rating)}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    client.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {client.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {client.email}
                  </div>
                  {client.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {client.phone}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {client.totalBookings} bookings • £{client.totalSpent.toFixed(2)} spent
                  </div>
                </div>

                {client.favoriteServices.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Favorite Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {client.favoriteServices.slice(0, 2).map((service, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-glam-pink/10 text-glam-pink"
                        >
                          {service}
                        </span>
                      ))}
                      {client.favoriteServices.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          +{client.favoriteServices.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {client.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{client.notes}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <History className="w-4 h-4 mr-1" />
                    History
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
