// Seed data para Joangel Nails Studio
// Servicios reales basados en CLAUDE.md

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Limpiar datos existentes
  await prisma.appointment.deleteMany({})
  await prisma.blockTime.deleteMany({})
  await prisma.businessHour.deleteMany({})
  await prisma.service.deleteMany({})

  // Servicios reales de Joangel Nails (desde CLAUDE.md)
  const services = await prisma.service.createMany({
    data: [
      {
        name: 'Semi Permanente Premium',
        description: 'Manicure con esmalte semipermanente de alta calidad. Incluye limado, cutícula y diseño básico.',
        durationMin: 75,
        basePriceCOP: 60000,
        defaultBufferMin: 15,
        active: true,
      },
      {
        name: 'Uñas Acrílicas con Molde',
        description: 'Extensión con acrílico moldeado, limado y diseño premium. Máxima durabilidad.',
        durationMin: 120,
        basePriceCOP: 100000,
        defaultBufferMin: 20,
        active: true,
      },
      {
        name: 'Forrado en Acrílico',
        description: 'Fortalecimiento de uña natural con acrílico. Perfecto para uñas débiles.',
        durationMin: 90,
        basePriceCOP: 85000,
        defaultBufferMin: 15,
        active: true,
      },
      {
        name: 'Uñas Acrílicas con Tips',
        description: 'Extensiones rápidas y perfectas para lucir uñas largas y estilizadas.',
        durationMin: 100,
        basePriceCOP: 80000,
        defaultBufferMin: 15,
        active: true,
      },
      {
        name: 'Pedicure Premium',
        description: 'Cuidado completo de pies con exfoliación, hidratación y esmaltado.',
        durationMin: 60,
        basePriceCOP: 45000,
        defaultBufferMin: 10,
        active: true,
      },
    ],
  })

  // Horarios laborales (de Lunes a Viernes 9:00-17:00, Domingos 9:00-12:00)
  const businessHours = await prisma.businessHour.createMany({
    data: [
      { weekday: 1, startTime: '09:00', endTime: '17:00' }, // Lunes
      { weekday: 2, startTime: '09:00', endTime: '17:00' }, // Martes
      { weekday: 3, startTime: '09:00', endTime: '17:00' }, // Miércoles
      { weekday: 4, startTime: '09:00', endTime: '17:00' }, // Jueves
      { weekday: 5, startTime: '09:00', endTime: '17:00' }, // Viernes
      { weekday: 0, startTime: '09:00', endTime: '12:00' }, // Domingo
      // Sábado libre (no trabajamos sábados)
    ],
  })

  console.log('✅ Database seeded successfully!')
  console.log(`📦 Created ${services.count} services`)
  console.log(`🕐 Created ${businessHours.count} business hours`)
  
  // Mostrar servicios creados
  const servicesData = await prisma.service.findMany()
  console.log('\n📋 Servicios disponibles:')
  servicesData.forEach(service => {
    console.log(`  • ${service.name}: $${service.basePriceCOP.toLocaleString()} COP (${service.durationMin} min)`)
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })