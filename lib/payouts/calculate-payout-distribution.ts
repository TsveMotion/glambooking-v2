import { prisma } from '@/lib/prisma'

export type PayoutSettingType = 'percentage_own' | 'percentage_total' | 'weekly_fixed' | 'daily_fixed'

export interface PayoutSettings {
  type: PayoutSettingType
  value: number
}

export interface StaffPayoutAllocation {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isOwner: boolean
  payoutSettings: PayoutSettings
  totalEarnings: number
  thisWeekEarnings: number
  bookingsCount: number
  totalBusinessRevenue: number
  ownBookingsRevenue: number
}

export interface PayoutDistributionTotals {
  totalGross: number
  totalNet: number
  platformFees: number
  businessThisWeekNet: number
  staffTotal: number
  staffWeekTotal: number
  ownerTotal: number
  ownerWeekTotal: number
}

interface CalculateParams {
  businessId: string
  owner: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string | null
  }
}

interface StaffStats {
  netTotal: number
  netWeek: number
  bookingsCount: number
  uniqueDays: Set<string>
  uniqueWeekDays: Set<string>
}

const DEFAULT_STAFF_SETTINGS: PayoutSettings = {
  type: 'percentage_own',
  value: 60
}

const OWNER_SETTINGS: PayoutSettings = {
  type: 'percentage_own',
  value: 100
}

function computeStaffPayout(
  settings: PayoutSettings,
  ownNet: number,
  totalNet: number,
  ownWeekNet: number,
  totalWeekNet: number,
  uniqueDaysAll: number,
  uniqueDaysWeek: number
) {
  let total = 0
  let week = 0

  switch (settings.type) {
    case 'percentage_own':
      total = ownNet * (settings.value / 100)
      week = ownWeekNet * (settings.value / 100)
      break
    case 'percentage_total':
      total = totalNet * (settings.value / 100)
      week = totalWeekNet * (settings.value / 100)
      break
    case 'weekly_fixed':
      total = settings.value
      week = settings.value
      break
    case 'daily_fixed':
      total = settings.value * uniqueDaysAll
      week = settings.value * uniqueDaysWeek
      break
    default:
      total = ownNet * 0.6
      week = ownWeekNet * 0.6
  }

  return { total, week }
}

export async function calculatePayoutDistribution({
  businessId,
  owner
}: CalculateParams): Promise<{
  allocations: StaffPayoutAllocation[]
  totals: PayoutDistributionTotals
}> {
  const [customization, staffMembers, bookings] = await Promise.all([
    prisma.businessCustomization.findUnique({ where: { businessId } }),
    prisma.staff.findMany({
      where: { businessId, isActive: true },
      include: { user: true }
    }),
    prisma.booking.findMany({
      where: { businessId, status: 'COMPLETED' },
      include: { staff: true },
      orderBy: { createdAt: 'desc' }
    })
  ])

  const savedSettings = (customization?.settings as any)?.staffPayoutSettings || {}

  let totalGross = 0
  let platformFees = 0
  let totalNet = 0
  let businessThisWeekNet = 0

  const thisWeek = new Date()
  thisWeek.setDate(thisWeek.getDate() - 7)

  const ownerStaffRecord = staffMembers.find((member) => member.userId === owner.id)
  const ownerKey = ownerStaffRecord?.id || 'OWNER'

  const staffStats: Record<string, StaffStats> = {}

  const ensureStats = (key: string) => {
    if (!staffStats[key]) {
      staffStats[key] = {
        netTotal: 0,
        netWeek: 0,
        bookingsCount: 0,
        uniqueDays: new Set<string>(),
        uniqueWeekDays: new Set<string>()
      }
    }
    return staffStats[key]
  }

  for (const booking of bookings) {
    const amount = Number(booking.totalAmount)
    // Platform fee is 5% which includes covering Stripe transaction fees (~1.5%)
    // So net platform revenue after Stripe fees is ~3.5%
    const platformFee = amount * 0.05
    const netAmount = amount - platformFee

    totalGross += amount
    platformFees += platformFee
    totalNet += netAmount

    const createdAt = new Date(booking.createdAt)
    const isThisWeek = createdAt >= thisWeek
    if (isThisWeek) {
      businessThisWeekNet += netAmount
    }

    const key = booking.staffId ?? ownerKey
    const stats = ensureStats(key)
    stats.netTotal += netAmount
    stats.bookingsCount += 1

    const dayKey = createdAt.toISOString().split('T')[0]
    stats.uniqueDays.add(dayKey)
    if (isThisWeek) {
      stats.netWeek += netAmount
      stats.uniqueWeekDays.add(dayKey)
    }
  }

  // Ensure stats exist for staff with no bookings
  for (const member of staffMembers) {
    ensureStats(member.id)
  }
  ensureStats(ownerKey)

  const allocations: StaffPayoutAllocation[] = staffMembers.map((member) => {
    const isOwner = member.userId === owner.id
    const stats = staffStats[member.id]
    const settings: PayoutSettings = savedSettings[member.id] || (isOwner ? OWNER_SETTINGS : DEFAULT_STAFF_SETTINGS)

    let totalEarnings = 0
    let thisWeekEarnings = 0

    if (!isOwner) {
      const payouts = computeStaffPayout(
        settings,
        stats.netTotal,
        totalNet,
        stats.netWeek,
        businessThisWeekNet,
        stats.uniqueDays.size,
        stats.uniqueWeekDays.size
      )
      totalEarnings = payouts.total
      thisWeekEarnings = payouts.week
    }

    return {
      id: member.id,
      firstName: member.firstName || member.user?.firstName || '',
      lastName: member.lastName || member.user?.lastName || '',
      email: member.email || member.user?.email || '',
      role: member.role,
      isOwner,
      payoutSettings: settings,
      totalEarnings,
      thisWeekEarnings,
      bookingsCount: stats.bookingsCount,
      totalBusinessRevenue: totalNet,
      ownBookingsRevenue: stats.netTotal
    }
  })

  let staffTotal = 0
  let staffWeekTotal = 0
  for (const allocation of allocations) {
    if (!allocation.isOwner) {
      staffTotal += allocation.totalEarnings
      staffWeekTotal += allocation.thisWeekEarnings
    }
  }

  const ownerStats = staffStats[ownerKey]

  let ownerAllocation = allocations.find((member) => member.isOwner)
  
  // Only create owner allocation if they have a staff record
  // This ensures consistency with the team page which only shows staff records
  if (!ownerAllocation) {
    // Owner doesn't have a staff record, so don't create a separate entry
    // Their earnings will be calculated as business remainder
    ownerAllocation = null as any
  }

  // Owner gets 100% of their own bookings (minus platform fee)
  const ownerTotal = ownerStats.netTotal
  const ownerWeekTotal = ownerStats.netWeek

  if (ownerAllocation) {
    ownerAllocation.totalEarnings = ownerTotal
    ownerAllocation.thisWeekEarnings = ownerWeekTotal
    ownerAllocation.payoutSettings = OWNER_SETTINGS
    ownerAllocation.bookingsCount = ownerStats.bookingsCount
    ownerAllocation.totalBusinessRevenue = totalNet
    ownerAllocation.ownBookingsRevenue = ownerStats.netTotal
    ownerAllocation.firstName = ownerAllocation.firstName || owner.firstName || ''
    ownerAllocation.lastName = ownerAllocation.lastName || owner.lastName || ''
    ownerAllocation.email = ownerAllocation.email || owner.email || ''
    ownerAllocation.role = ownerAllocation.role || 'owner'
  }

  allocations.sort((a, b) => {
    if (a.isOwner) return -1
    if (b.isOwner) return 1
    return b.totalEarnings - a.totalEarnings
  })

  const totals: PayoutDistributionTotals = {
    totalGross,
    totalNet,
    platformFees,
    businessThisWeekNet,
    staffTotal,
    staffWeekTotal,
    ownerTotal,
    ownerWeekTotal
  }

  return { allocations, totals }
}
