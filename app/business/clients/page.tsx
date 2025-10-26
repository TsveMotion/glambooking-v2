'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  totalBookings: number
  totalSpent: number
  lastBooking: string
  status: 'ACTIVE' | 'INACTIVE'
  joinDate: string
}

export default function ClientsPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login')
      return
    }
    
    if (isLoaded && userId) {
      fetchClients()
    }
  }, [isLoaded, userId, router])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/business/clients')
      
      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }
      
      const data = await response.json()
      setClients(data.clients || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'ALL' || client.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const totalClients = clients.length
  const activeClients = clients.filter(c => c.status === 'ACTIVE').length
  const totalRevenue = clients.reduce((sum, client) => sum + client.totalSpent, 0)
  const avgSpentPerClient = totalClients > 0 ? totalRevenue / totalClients : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-600">Manage your client relationships and track customer data</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button className="glam-gradient text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-glam-charcoal">{totalClients}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-3xl font-bold text-glam-charcoal">{activeClients}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-glam-charcoal">£{totalRevenue.toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 bg-glam-pink rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Spent</p>
                <p className="text-3xl font-bold text-glam-charcoal">£{avgSpentPerClient.toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 bg-glam-gold rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-lg mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink focus:border-transparent"
              >
                <option value="ALL">All Clients</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-glam-charcoal">Client List</CardTitle>
          <CardDescription>
            Showing {filteredClients.length} of {totalClients} clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-glam-pink rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-glam-charcoal">
                        {client.firstName} {client.lastName}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {client.email}
                        </div>
                        {client.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Bookings</p>
                      <p className="text-lg font-semibold text-glam-charcoal">{client.totalBookings}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-lg font-semibold text-glam-charcoal">£{client.totalSpent.toFixed(0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        client.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {client.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No clients found</p>
                <p className="text-sm text-gray-400">
                  {searchTerm || filterStatus !== 'ALL' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Add your first client to get started'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
