const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixPlanData() {
  try {
    console.log('🔍 Checking all businesses...')
    
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        plan: true,
        stripeSubscriptionId: true,
        planStartDate: true,
        planEndDate: true
      }
    })

    console.log(`Found ${businesses.length} business(es)`)
    
    for (const business of businesses) {
      console.log(`\n📊 Business: ${business.name}`)
      console.log(`   Current plan: ${business.plan}`)
      console.log(`   Stripe subscription: ${business.stripeSubscriptionId || 'none'}`)
      
      // If no active subscription, should be on free plan
      if (!business.stripeSubscriptionId && business.plan !== 'free') {
        console.log(`   ⚠️  No subscription but plan is "${business.plan}" - fixing to "free"`)
        
        await prisma.business.update({
          where: { id: business.id },
          data: {
            plan: 'free',
            maxStaff: 1,
            planStartDate: new Date(),
            planEndDate: null,
            stripeSubscriptionId: null
          }
        })
        
        console.log(`   ✅ Updated to free plan`)
      } else {
        console.log(`   ✅ Plan data looks correct`)
      }
    }
    
    console.log('\n✨ Done!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixPlanData()
