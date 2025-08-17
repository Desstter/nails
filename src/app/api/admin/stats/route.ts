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
          message: 'No tienes permisos para acceder a esta información'
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    // Fechas para las consultas
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Domingo
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Obtener estadísticas
    const [
      todayAppointments,
      thisWeekAppointments,
      thisMonthAppointments,
      pendingAppointments
    ] = await Promise.all([
      // Citas de hoy
      prisma.appointment.count({
        where: {
          startAt: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          },
          status: {
            in: ['pending', 'confirmed']
          }
        }
      }),

      // Citas de esta semana
      prisma.appointment.count({
        where: {
          startAt: {
            gte: startOfWeek
          },
          status: {
            in: ['pending', 'confirmed', 'completed']
          }
        }
      }),

      // Citas de este mes (para calcular ingresos)
      prisma.appointment.findMany({
        where: {
          startAt: {
            gte: startOfMonth
          },
          status: {
            in: ['confirmed', 'completed']
          }
        },
        select: {
          priceCOP: true
        }
      }),

      // Citas pendientes
      prisma.appointment.count({
        where: {
          status: 'pending'
        }
      })
    ])

    // Calcular ingresos del mes
    const thisMonthRevenue = thisMonthAppointments.reduce((total, appointment) => {
      return total + appointment.priceCOP
    }, 0)

    const stats = {
      todayAppointments,
      thisWeekAppointments,
      thisMonthRevenue,
      pendingAppointments
    }

    const response: APIResponse<typeof stats> = {
      success: true,
      data: stats
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    
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