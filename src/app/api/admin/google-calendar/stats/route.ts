import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { APIResponse } from '@/types/booking'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'UNAUTHORIZED',
          message: 'No tienes permisos para ver estadísticas'
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    // Obtener fecha de hace 30 días
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Estadísticas de citas con eventos de Google Calendar
    const totalAppointments = await prisma.appointment.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    const appointmentsWithGoogleEvent = await prisma.appointment.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        },
        googleEventId: {
          not: null
        }
      }
    })

    // Citas recientes con eventos de Google Calendar
    const recentAppointments = await prisma.appointment.findMany({
      where: {
        googleEventId: {
          not: null
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        service: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Estadísticas de configuración
    const googleConfig = await prisma.googleCalendarConfig.findUnique({
      where: { userId: session.user.id }
    })

    const stats = {
      totalAppointments,
      appointmentsWithGoogleEvent,
      syncSuccessRate: totalAppointments > 0 ? 
        Math.round((appointmentsWithGoogleEvent / totalAppointments) * 100) : 0,
      isConfigured: !!googleConfig?.isConnected,
      autoCreateEnabled: googleConfig?.autoCreateEvents || false,
      recentEvents: recentAppointments.map(apt => ({
        id: apt.id,
        clientName: apt.clientName,
        serviceName: apt.service.name,
        startAt: apt.startAt,
        googleEventId: apt.googleEventId,
        createdAt: apt.createdAt
      })),
      periodDays: 30
    }

    const response: APIResponse<typeof stats> = {
      success: true,
      data: stats
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error getting calendar stats:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'STATS_ERROR',
        message: 'Error al obtener estadísticas'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}