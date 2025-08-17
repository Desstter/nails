import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { APIResponse } from '@/types/booking'

interface TrendData {
  date: string
  totalAppointments: number
  syncedAppointments: number
  syncRate: number
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'UNAUTHORIZED',
          message: 'No tienes permisos para ver tendencias'
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    // Calcular fecha de inicio
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    // Generar array de fechas para los últimos X días
    const dateRange = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dateRange.push(date.toISOString().split('T')[0])
    }

    // Obtener datos agrupados por fecha
    const appointmentsByDate = await prisma.appointment.groupBy({
      by: ['startAt'],
      where: {
        startAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    })

    const syncedAppointmentsByDate = await prisma.appointment.groupBy({
      by: ['startAt'],
      where: {
        startAt: {
          gte: startDate
        },
        googleEventId: {
          not: null
        }
      },
      _count: {
        id: true
      }
    })

    // Procesar datos para generar tendencias diarias
    const trendsData: TrendData[] = dateRange.map(date => {
      const dateStart = new Date(date + 'T00:00:00')
      const dateEnd = new Date(date + 'T23:59:59')

      // Contar citas del día
      const totalAppointments = appointmentsByDate
        .filter(apt => {
          const aptDate = new Date(apt.startAt)
          return aptDate >= dateStart && aptDate <= dateEnd
        })
        .reduce((sum, apt) => sum + apt._count.id, 0)

      // Contar citas sincronizadas del día
      const syncedAppointments = syncedAppointmentsByDate
        .filter(apt => {
          const aptDate = new Date(apt.startAt)
          return aptDate >= dateStart && aptDate <= dateEnd
        })
        .reduce((sum, apt) => sum + apt._count.id, 0)

      const syncRate = totalAppointments > 0 ? 
        Math.round((syncedAppointments / totalAppointments) * 100) : 0

      return {
        date,
        totalAppointments,
        syncedAppointments,
        syncRate
      }
    })

    // Estadísticas adicionales
    const totalInPeriod = trendsData.reduce((sum, day) => sum + day.totalAppointments, 0)
    const syncedInPeriod = trendsData.reduce((sum, day) => sum + day.syncedAppointments, 0)
    const avgSyncRate = totalInPeriod > 0 ? 
      Math.round((syncedInPeriod / totalInPeriod) * 100) : 0

    // Calcular tendencia (comparar primera vs segunda mitad del período)
    const midPoint = Math.floor(days / 2)
    const firstHalf = trendsData.slice(0, midPoint)
    const secondHalf = trendsData.slice(midPoint)

    const firstHalfAvg = firstHalf.length > 0 ? 
      firstHalf.reduce((sum, day) => sum + day.syncRate, 0) / firstHalf.length : 0
    const secondHalfAvg = secondHalf.length > 0 ? 
      secondHalf.reduce((sum, day) => sum + day.syncRate, 0) / secondHalf.length : 0

    const trend = secondHalfAvg - firstHalfAvg

    const response: APIResponse<{
      trends: TrendData[]
      summary: {
        totalAppointments: number
        syncedAppointments: number
        avgSyncRate: number
        trend: number
        period: number
      }
    }> = {
      success: true,
      data: {
        trends: trendsData,
        summary: {
          totalAppointments: totalInPeriod,
          syncedAppointments: syncedInPeriod,
          avgSyncRate,
          trend,
          period: days
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error getting calendar trends:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'TRENDS_ERROR',
        message: 'Error al obtener tendencias'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}