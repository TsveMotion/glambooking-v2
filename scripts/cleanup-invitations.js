const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupInvitations() {
  try {
    console.log('Cleaning up team invitations...')
    
    // Find all invitations
    const allInvitations = await prisma.teamInvitation.findMany({
      include: {
        business: {
          select: { name: true }
        }
      }
    })
    
    console.log(`Found ${allInvitations.length} invitations:`)
    allInvitations.forEach(inv => {
      console.log(`- ${inv.id}: ${inv.email} to ${inv.business.name} (${inv.status}) - Expires: ${inv.expiresAt}`)
    })
    
    // Delete expired invitations that are still PENDING
    const expiredInvitations = await prisma.teamInvitation.deleteMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          lt: new Date()
        }
      }
    })
    
    console.log(`Deleted ${expiredInvitations.count} expired invitations`)
    
    // Find duplicate invitations (same email + businessId)
    const duplicates = await prisma.teamInvitation.groupBy({
      by: ['email', 'businessId'],
      having: {
        email: {
          _count: {
            gt: 1
          }
        }
      }
    })
    
    console.log(`Found ${duplicates.length} duplicate invitation groups`)
    
    // For each duplicate group, keep the most recent one and delete the rest
    for (const duplicate of duplicates) {
      const invitations = await prisma.teamInvitation.findMany({
        where: {
          email: duplicate.email,
          businessId: duplicate.businessId
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      // Keep the first (most recent) and delete the rest
      const toDelete = invitations.slice(1)
      
      for (const inv of toDelete) {
        await prisma.teamInvitation.delete({
          where: { id: inv.id }
        })
        console.log(`Deleted duplicate invitation: ${inv.id}`)
      }
    }
    
    console.log('Cleanup completed!')
    
  } catch (error) {
    console.error('Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupInvitations()
