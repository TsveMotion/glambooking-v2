'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Plus,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  Crown,
  UserCheck,
  UserX,
  Star
} from 'lucide-react'

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  isActive: boolean
  imageUrl?: string
  createdAt: string
}

interface Business {
  id: string
  name: string
  plan: 'starter' | 'professional' | 'enterprise'
  teamMembers: TeamMember[]
}

export default function TeamPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Staff'
  })

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login')
      return
    }
    
    if (isLoaded && userId) {
      fetchTeamData()
    }
  }, [isLoaded, userId, router])

  const fetchTeamData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/business/team')
      
      if (!response.ok) {
        throw new Error('Failed to fetch team data')
      }
      
      const data = await response.json()
      setBusiness(data.business)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getPlanLimits = (plan: string) => {
    switch (plan) {
      case 'starter': return { maxTeam: 3, name: 'Starter' }
      case 'professional': return { maxTeam: 10, name: 'Professional' }
      case 'enterprise': return { maxTeam: -1, name: 'Enterprise' }
      default: return { maxTeam: 3, name: 'Starter' }
    }
  }

  const handleAddMember = async () => {
    if (!newMember.firstName || !newMember.lastName || !newMember.email) {
      alert('Please fill in all required fields')
      return
    }

    const planLimits = getPlanLimits(business?.plan || 'starter')
    const currentTeamSize = business?.teamMembers?.length || 0

    if (planLimits.maxTeam !== -1 && currentTeamSize >= planLimits.maxTeam) {
      alert(`Your ${planLimits.name} plan allows up to ${planLimits.maxTeam} team members. Please upgrade to add more.`)
      return
    }

    try {
      // Send invitation email instead of directly adding member
      const response = await fetch('/api/business/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      })

      if (response.ok) {
        const result = await response.json()
        setShowAddModal(false)
        setNewMember({ firstName: '', lastName: '', email: '', phone: '', role: 'Staff' })
        alert(`Invitation sent successfully to ${newMember.email}! They will receive an email with signup instructions.`)
        fetchTeamData() // Refresh to show pending invitations
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send invitation')
      }
    } catch (error) {
      alert('Failed to send invitation')
    }
  }

  const toggleMemberStatus = async (memberId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/business/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        fetchTeamData()
      }
    } catch (error) {
      alert('Failed to update team member')
    }
  }

  const deleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return

    try {
      const response = await fetch(`/api/business/team/${memberId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTeamData()
      }
    } catch (error) {
      alert('Failed to remove team member')
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchTeamData}>Retry</Button>
        </div>
      </div>
    )
  }

  const planLimits = getPlanLimits(business?.plan || 'starter')
  const currentTeamSize = business?.teamMembers?.length || 0
  const canAddMore = planLimits.maxTeam === -1 || currentTeamSize < planLimits.maxTeam

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">
            Manage your team members and their access ({currentTeamSize}/{planLimits.maxTeam === -1 ? '∞' : planLimits.maxTeam} members)
          </p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          disabled={!canAddMore}
          className="bg-glam-pink hover:bg-glam-pink/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Plan Limits Warning */}
      {!canAddMore && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Team Limit Reached</p>
                  <p className="text-sm text-amber-700">
                    Your {planLimits.name} plan allows up to {planLimits.maxTeam} team members.
                  </p>
                </div>
              </div>
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {business?.teamMembers?.map((member) => (
          <Card key={member.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-glam-pink rounded-full flex items-center justify-center">
                    {member.imageUrl ? (
                      <img 
                        src={member.imageUrl} 
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold">
                        {member.firstName[0]}{member.lastName[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {member.firstName} {member.lastName}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === 'Owner' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {member.role === 'Owner' && <Crown className="w-3 h-3 mr-1" />}
                        {member.role}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        member.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.isActive ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {member.email}
                </div>
                {member.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {member.phone}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {new Date(member.createdAt).toLocaleDateString()}
                </div>
              </div>

              {member.role !== 'Owner' && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleMemberStatus(member.id, member.isActive)}
                    className="flex-1"
                  >
                    {member.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMember(member.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )) || (
          <div className="col-span-full text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-600 mb-4">Start building your team by adding your first member</p>
            <Button onClick={() => setShowAddModal(true)} className="bg-glam-pink hover:bg-glam-pink/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={newMember.firstName}
                      onChange={(e) => setNewMember(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={newMember.lastName}
                      onChange={(e) => setNewMember(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newMember.phone}
                    onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink"
                    placeholder="+44 123 456 7890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink"
                  >
                    <option value="Staff">Staff</option>
                    <option value="Manager">Manager</option>
                    <option value="Stylist">Stylist</option>
                    <option value="Receptionist">Receptionist</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMember}
                  className="flex-1 bg-glam-pink hover:bg-glam-pink/90"
                >
                  Add Member
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
