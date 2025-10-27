const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createSampleData() {
  try {
    console.log('Creating sample data...')

    // Get the staff member and business
    const staff = await prisma.staff.findFirst({
      include: {
        business: true
      }
    })

    if (!staff) {
      console.log('No staff found. Please create a staff member first.')
      return
    }

    console.log(`Found staff: ${staff.firstName} ${staff.lastName} at ${staff.business.name}`)

    // Get or create services
    let services = await prisma.service.findMany({
      where: { businessId: staff.businessId }
    })

    if (services.length === 0) {
      console.log('Creating sample services...')
      services = await Promise.all([
        prisma.service.create({
          data: {
            name: 'Hair Cut & Style',
            description: 'Professional haircut and styling',
            duration: 60,
            price: 45.00,
            businessId: staff.businessId,
            category: 'Hair'
          }
        }),
        prisma.service.create({
          data: {
            name: 'Color & Highlights',
            description: 'Hair coloring and highlights',
            duration: 120,
            price: 85.00,
            businessId: staff.businessId,
            category: 'Hair'
          }
        }),
        prisma.service.create({
          data: {
            name: 'Manicure',
            description: 'Professional nail care',
            duration: 45,
            price: 25.00,
            businessId: staff.businessId,
            category: 'Nails'
          }
        }),
        prisma.service.create({
          data: {
            name: 'Facial Treatment',
            description: 'Relaxing facial treatment',
            duration: 90,
            price: 65.00,
            businessId: staff.businessId,
            category: 'Skincare'
          }
        })
      ])
    }

    // Create sample clients
    console.log('Creating sample clients...')
    const clients = await Promise.all([
      prisma.client.create({
        data: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+44 123 456 7890',
          businessId: staff.businessId,
          notes: 'Prefers shorter layers, allergic to certain dyes'
        }
      }).catch(() => null), // Ignore if already exists
      prisma.client.create({
        data: {
          firstName: 'Emma',
          lastName: 'Wilson',
          email: 'emma.wilson@example.com',
          phone: '+44 987 654 3210',
          businessId: staff.businessId
        }
      }).catch(() => null),
      prisma.client.create({
        data: {
          firstName: 'Lisa',
          lastName: 'Brown',
          email: 'lisa.brown@example.com',
          phone: '+44 555 123 4567',
          businessId: staff.businessId,
          notes: 'VIP client, very loyal'
        }
      }).catch(() => null),
      prisma.client.create({
        data: {
          firstName: 'Rachel',
          lastName: 'Davis',
          email: 'rachel.davis@example.com',
          businessId: staff.businessId
        }
      }).catch(() => null)
    ])

    const validClients = clients.filter(Boolean)
    console.log(`Created ${validClients.length} clients`)

    // Create sample bookings
    console.log('Creating sample bookings...')
    const now = new Date()
    const bookings = []

    // Past completed bookings
    for (let i = 0; i < 10; i++) {
      const pastDate = new Date(now)
      pastDate.setDate(now.getDate() - Math.floor(Math.random() * 30) - 1)
      pastDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0)

      const client = validClients[Math.floor(Math.random() * validClients.length)]
      const service = services[Math.floor(Math.random() * services.length)]

      if (client && service) {
        const booking = await prisma.booking.create({
          data: {
            startTime: pastDate,
            endTime: new Date(pastDate.getTime() + service.duration * 60000),
            status: 'COMPLETED',
            totalAmount: service.price,
            clientName: `${client.firstName} ${client.lastName}`,
            clientEmail: client.email,
            clientPhone: client.phone,
            businessId: staff.businessId,
            staffId: staff.id,
            serviceId: service.id,
            notes: Math.random() > 0.7 ? 'Great session, client very happy' : null
          }
        })

        // Create payment for completed booking
        await prisma.payment.create({
          data: {
            amount: service.price,
            platformFee: service.price * 0.05, // 5% platform fee
            businessAmount: service.price * 0.95,
            status: 'COMPLETED',
            bookingId: booking.id,
            stripePaymentId: `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
        })

        bookings.push(booking)
      }
    }

    // Today's bookings
    const today = new Date()
    today.setHours(9, 0, 0, 0)
    
    for (let i = 0; i < 3; i++) {
      const todayTime = new Date(today)
      todayTime.setHours(9 + i * 2, 0, 0, 0)

      const client = validClients[Math.floor(Math.random() * validClients.length)]
      const service = services[Math.floor(Math.random() * services.length)]

      if (client && service) {
        await prisma.booking.create({
          data: {
            startTime: todayTime,
            endTime: new Date(todayTime.getTime() + service.duration * 60000),
            status: i === 0 ? 'CONFIRMED' : 'PENDING',
            totalAmount: service.price,
            clientName: `${client.firstName} ${client.lastName}`,
            clientEmail: client.email,
            clientPhone: client.phone,
            businessId: staff.businessId,
            staffId: staff.id,
            serviceId: service.id
          }
        })
      }
    }

    // Future bookings
    for (let i = 1; i <= 5; i++) {
      const futureDate = new Date(now)
      futureDate.setDate(now.getDate() + i)
      futureDate.setHours(10 + Math.floor(Math.random() * 6), 0, 0, 0)

      const client = validClients[Math.floor(Math.random() * validClients.length)]
      const service = services[Math.floor(Math.random() * services.length)]

      if (client && service) {
        await prisma.booking.create({
          data: {
            startTime: futureDate,
            endTime: new Date(futureDate.getTime() + service.duration * 60000),
            status: 'CONFIRMED',
            totalAmount: service.price,
            clientName: `${client.firstName} ${client.lastName}`,
            clientEmail: client.email,
            clientPhone: client.phone,
            businessId: staff.businessId,
            staffId: staff.id,
            serviceId: service.id
          }
        })
      }
    }

    console.log(`Created ${bookings.length} completed bookings with payments`)
    console.log('Sample data creation completed!')

  } catch (error) {
    console.error('Error creating sample data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleData()
