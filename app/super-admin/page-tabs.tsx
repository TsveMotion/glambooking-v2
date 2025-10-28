// Tab content components for super admin dashboard
// This file contains all the tab views for different entities

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  UserCircle, ShoppingBag, Calendar, DollarSign, Users, 
  TrendingUp, Mail, Eye, CheckCircle, XCircle, Building2 
} from 'lucide-react'

// Staff Tab
export function StaffTab({ staff, searchTerm }: { staff: any[], searchTerm: string }) {
  const filtered = staff.filter(s => 
    s.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.business?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((member) => (
        <Card key={member.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                {member.firstName?.[0]}{member.lastName?.[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {member.firstName} {member.lastName}
                </h3>
                <p className="text-sm text-gray-600">{member.email || 'No email'}</p>
                <p className="text-xs text-gray-500 mt-1">{member.business?.name}</p>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium capitalize">{member.role}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Bookings:</span>
                    <span className="font-medium">{member._count?.bookings || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Services:</span>
                    <span className="font-medium">{member._count?.staffServices || 0}</span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  {member.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Inactive
                    </span>
                  )}
                  {member.business?.isWhiteLabel && (
                    <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                      White-Label
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Joined {new Date(member.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {filtered.length === 0 && (
        <div className="col-span-3 text-center py-12">
          <UserCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No staff members found</p>
        </div>
      )}
    </div>
  )
}

// Services Tab
export function ServicesTab({ services, searchTerm }: { services: any[], searchTerm: string }) {
  const filtered = services.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.business?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((service) => (
        <Card key={service.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                <p className="text-sm text-gray-600">{service.business?.name}</p>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium text-green-600">£{Number(service.price).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{service.duration} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Bookings:</span>
                    <span className="font-medium">{service._count?.bookings || 0}</span>
                  </div>
                  {service.category && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{service.category}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  {service.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      Inactive
                    </span>
                  )}
                  {service.business?.isWhiteLabel && (
                    <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                      White-Label
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {filtered.length === 0 && (
        <div className="col-span-3 text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No services found</p>
        </div>
      )}
    </div>
  )
}

// Bookings Tab
export function BookingsTab({ bookings, searchTerm }: { bookings: any[], searchTerm: string }) {
  const filtered = bookings.filter(b => 
    b.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.business?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700'
      case 'PENDING': return 'bg-yellow-100 text-yellow-700'
      case 'CANCELLED': return 'bg-red-100 text-red-700'
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-4">
      {filtered.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center text-white">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{booking.clientName}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Service: <strong>{booking.service?.name}</strong></p>
                      <p className="text-gray-600">Business: <strong>{booking.business?.name}</strong></p>
                      <p className="text-gray-600">Staff: <strong>{booking.staff?.firstName} {booking.staff?.lastName}</strong></p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date: <strong>{new Date(booking.startTime).toLocaleDateString()}</strong></p>
                      <p className="text-gray-600">Time: <strong>{new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong></p>
                      <p className="text-gray-600">Amount: <strong className="text-green-600">£{Number(booking.totalAmount).toFixed(2)}</strong></p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Booked {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No bookings found</p>
        </div>
      )}
    </div>
  )
}

// Payments Tab
export function PaymentsTab({ payments, searchTerm }: { payments: any[], searchTerm: string }) {
  const filtered = payments.filter(p => 
    p.booking?.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.booking?.business?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.stripePaymentId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700'
      case 'PENDING': return 'bg-yellow-100 text-yellow-700'
      case 'PROCESSING': return 'bg-blue-100 text-blue-700'
      case 'FAILED': return 'bg-red-100 text-red-700'
      case 'REFUNDED': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-4">
      {filtered.map((payment) => (
        <Card key={payment.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-600 to-teal-600 flex items-center justify-center text-white">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">£{Number(payment.amount).toFixed(2)}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Business: <strong>{payment.booking?.business?.name}</strong></p>
                      <p className="text-gray-600">Client: <strong>{payment.booking?.clientName}</strong></p>
                      <p className="text-gray-600">Service: <strong>{payment.booking?.service?.name}</strong></p>
                    </div>
                    <div>
                      <p className="text-gray-600">Platform Fee: <strong className="text-purple-600">£{Number(payment.platformFee).toFixed(2)}</strong></p>
                      <p className="text-gray-600">Business Amount: <strong className="text-green-600">£{Number(payment.businessAmount).toFixed(2)}</strong></p>
                      <p className="text-gray-600">Currency: <strong>{payment.currency}</strong></p>
                    </div>
                  </div>
                  
                  {payment.stripePaymentId && (
                    <p className="text-xs text-gray-500 mt-2">Stripe ID: {payment.stripePaymentId}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(payment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No payments found</p>
        </div>
      )}
    </div>
  )
}

// Clients Tab
export function ClientsTab({ clients, searchTerm }: { clients: any[], searchTerm: string }) {
  const filtered = clients.filter(c => 
    c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.business?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((client) => (
        <Card key={client.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {client.firstName?.[0]}{client.lastName?.[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {client.firstName} {client.lastName}
                </h3>
                <p className="text-sm text-gray-600">{client.email}</p>
                <p className="text-xs text-gray-500 mt-1">{client.business?.name}</p>
                
                {client.phone && (
                  <p className="text-sm text-gray-600 mt-2">📞 {client.phone}</p>
                )}
                
                {client.dateOfBirth && (
                  <p className="text-sm text-gray-600 mt-1">
                    🎂 {new Date(client.dateOfBirth).toLocaleDateString()}
                  </p>
                )}
                
                {client.business?.isWhiteLabel && (
                  <span className="inline-block mt-2 px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                    White-Label
                  </span>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  Added {new Date(client.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {filtered.length === 0 && (
        <div className="col-span-3 text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No clients found</p>
        </div>
      )}
    </div>
  )
}

// Subscriptions Tab
export function SubscriptionsTab({ subscriptions, searchTerm }: { subscriptions: any[], searchTerm: string }) {
  const filtered = subscriptions.filter(s => 
    s.business?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.business?.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.plan?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-700'
      case 'PROFESSIONAL': return 'bg-blue-100 text-blue-700'
      case 'STARTER': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-4">
      {filtered.map((sub) => (
        <Card key={sub.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{sub.business?.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlanColor(sub.plan)}`}>
                      {sub.plan}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Owner: <strong>{sub.business?.owner?.firstName} {sub.business?.owner?.lastName}</strong></p>
                      <p className="text-gray-600">Email: <strong>{sub.business?.owner?.email}</strong></p>
                    </div>
                    <div>
                      {sub.currentPeriodEnd && (
                        <p className="text-gray-600">Period End: <strong>{new Date(sub.currentPeriodEnd).toLocaleDateString()}</strong></p>
                      )}
                      {sub.cancelAtPeriodEnd && (
                        <p className="text-red-600 font-medium">⚠️ Cancels at period end</p>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Created {new Date(sub.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No subscriptions found</p>
        </div>
      )}
    </div>
  )
}

// Payouts Tab
export function PayoutsTab({ payouts, searchTerm }: { payouts: any[], searchTerm: string }) {
  const filtered = payouts.filter(p => 
    p.business?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.business?.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {filtered.map((payout) => (
        <Card key={payout.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center text-white">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">£{Number(payout.amount).toFixed(2)}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      payout.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      payout.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {payout.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Business: <strong>{payout.business?.name}</strong></p>
                      <p className="text-gray-600">Owner: <strong>{payout.business?.owner?.firstName} {payout.business?.owner?.lastName}</strong></p>
                      <p className="text-gray-600">Email: <strong>{payout.business?.owner?.email}</strong></p>
                    </div>
                    <div>
                      {payout.description && (
                        <p className="text-gray-600">Description: <strong>{payout.description}</strong></p>
                      )}
                      {payout.stripeTransferId && (
                        <p className="text-xs text-gray-500">Stripe ID: {payout.stripeTransferId}</p>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(payout.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No payouts found</p>
        </div>
      )}
    </div>
  )
}

// Team Invitations Tab
export function InvitationsTab({ invitations, searchTerm }: { invitations: any[], searchTerm: string }) {
  const filtered = invitations.filter(i => 
    i.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.business?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-700'
      case 'PENDING': return 'bg-yellow-100 text-yellow-700'
      case 'EXPIRED': return 'bg-red-100 text-red-700'
      case 'REJECTED': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((invitation) => (
        <Card key={invitation.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center text-white">
                <Mail className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {invitation.firstName} {invitation.lastName}
                </h3>
                <p className="text-sm text-gray-600">{invitation.email}</p>
                <p className="text-xs text-gray-500 mt-1">{invitation.business?.name}</p>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium capitalize">{invitation.role}</span>
                  </div>
                  {invitation.phone && (
                    <p className="text-sm text-gray-600">📞 {invitation.phone}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Invited by:</span>
                    <span className="font-medium">{invitation.inviter?.firstName || 'Unknown'}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invitation.status)}`}>
                    {invitation.status}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Sent {new Date(invitation.createdAt).toLocaleDateString()}
                </p>
                {invitation.expiresAt && (
                  <p className="text-xs text-gray-500">
                    Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {filtered.length === 0 && (
        <div className="col-span-3 text-center py-12">
          <Mail className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No invitations found</p>
        </div>
      )}
    </div>
  )
}
