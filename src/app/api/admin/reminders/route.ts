import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { send24HourReminder, send1HourReminder } from '@/lib/whatsapp-notifications'

// API para procesar recordatorios automatizados
// Se debe llamar cada 15 minutos via cron job o similar

export async function POST(request: NextRequest) {
  try {
    const now = new Date()
    
    // 1. Recordatorios 24 horas antes
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(23, 59, 59, 999)

    const appointmentsFor24HReminder = await prisma.appointment.findMany({
      where: {
        startAt: {
          gte: tomorrow,
          lte: tomorrowEnd
        },
        status: { in: ['confirmed', 'pending'] },
        // Solo enviar una vez (podríamos agregar un campo last24HReminderSent)
      },
      include: {
        service: true
      }
    })

    console.log(`📅 Processing ${appointmentsFor24HReminder.length} appointments for 24h reminders`)

    // 2. Recordatorios 1 hora antes
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000) // +1 hora
    const oneHourRangeStart = new Date(oneHourFromNow.getTime() - 15 * 60 * 1000) // -15 min
    const oneHourRangeEnd = new Date(oneHourFromNow.getTime() + 15 * 60 * 1000) // +15 min

    const appointmentsFor1HReminder = await prisma.appointment.findMany({
      where: {
        startAt: {
          gte: oneHourRangeStart,
          lte: oneHourRangeEnd
        },
        status: { in: ['confirmed', 'pending'] },
      },
      include: {
        service: true
      }
    })

    console.log(`⏰ Processing ${appointmentsFor1HReminder.length} appointments for 1h reminders`)

    // Procesar recordatorios 24h
    const reminder24Results = await Promise.allSettled(
      appointmentsFor24HReminder.map(async (appointment) => {
        try {
          const sent = await send24HourReminder(appointment)
          return { appointmentId: appointment.id, type: '24h', sent }
        } catch (error) {
          console.error(`Error sending 24h reminder for ${appointment.id}:`, error)
          return { appointmentId: appointment.id, type: '24h', sent: false, error }
        }
      })
    )

    // Procesar recordatorios 1h
    const reminder1HResults = await Promise.allSettled(
      appointmentsFor1HReminder.map(async (appointment) => {
        try {
          const sent = await send1HourReminder(appointment)
          return { appointmentId: appointment.id, type: '1h', sent }
        } catch (error) {
          console.error(`Error sending 1h reminder for ${appointment.id}:`, error)
          return { appointmentId: appointment.id, type: '1h', sent: false, error }
        }
      })
    )

    // Resumir resultados
    const successful24h = reminder24Results.filter(r => r.status === 'fulfilled' && r.value.sent).length
    const successful1h = reminder1HResults.filter(r => r.status === 'fulfilled' && r.value.sent).length

    const results = {
      timestamp: now.toISOString(),
      reminders24h: {
        total: appointmentsFor24HReminder.length,
        successful: successful24h,
        failed: appointmentsFor24HReminder.length - successful24h
      },
      reminders1h: {
        total: appointmentsFor1HReminder.length,
        successful: successful1h,
        failed: appointmentsFor1HReminder.length - successful1h
      },
      details: {
        reminder24Results: reminder24Results.map(r => r.status === 'fulfilled' ? r.value : { error: 'Failed' }),
        reminder1HResults: reminder1HResults.map(r => r.status === 'fulfilled' ? r.value : { error: 'Failed' })
      }
    }

    console.log('📊 Reminder processing completed:', {
      '24h_sent': successful24h,
      '1h_sent': successful1h,
      total_processed: appointmentsFor24HReminder.length + appointmentsFor1HReminder.length
    })

    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('Error processing reminders:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error processing reminders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Endpoint GET para verificar próximos recordatorios (solo admin)
export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    
    // Verificar próximos recordatorios 24h
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(23, 59, 59, 999)

    const upcoming24h = await prisma.appointment.count({
      where: {
        startAt: {
          gte: tomorrow,
          lte: tomorrowEnd
        },
        status: { in: ['confirmed', 'pending'] }
      }
    })

    // Verificar próximos recordatorios 1h
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    const oneHourRangeStart = new Date(oneHourFromNow.getTime() - 15 * 60 * 1000)
    const oneHourRangeEnd = new Date(oneHourFromNow.getTime() + 15 * 60 * 1000)

    const upcoming1h = await prisma.appointment.count({
      where: {
        startAt: {
          gte: oneHourRangeStart,
          lte: oneHourRangeEnd
        },
        status: { in: ['confirmed', 'pending'] }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        timestamp: now.toISOString(),
        upcomingReminders: {
          reminder24h: upcoming24h,
          reminder1h: upcoming1h
        }
      }
    })

  } catch (error) {
    console.error('Error checking reminders:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error checking reminders'
    }, { status: 500 })
  }
}