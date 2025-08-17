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

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Construir filtro de fechas
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      const endDateTime = new Date(endDate)
      endDateTime.setHours(23, 59, 59, 999)
      dateFilter.lte = endDateTime
    }

    const whereClause: any = {}
    if (Object.keys(dateFilter).length > 0) {
      whereClause.createdAt = dateFilter
    }

    // Obtener todas las citas en el rango
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            name: true
          }
        }
      }
    })

    // Calcular métricas principales
    const totalAppointments = appointments.length
    const completedAppointments = appointments.filter(apt => apt.status === 'completed')
    const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled')
    
    const totalRevenue = completedAppointments.reduce((sum, apt) => sum + apt.priceCOP, 0)
    const avgAppointmentValue = totalAppointments > 0 ? totalRevenue / totalAppointments : 0
    const completionRate = totalAppointments > 0 ? (completedAppointments.length / totalAppointments) * 100 : 0
    const cancellationRate = totalAppointments > 0 ? (cancelledAppointments.length / totalAppointments) * 100 : 0

    // Breakdown por servicios
    const serviceMap = new Map<string, { count: number; revenue: number }>()
    
    appointments.forEach(apt => {
      const serviceName = apt.service.name
      const current = serviceMap.get(serviceName) || { count: 0, revenue: 0 }
      
      current.count++
      if (apt.status === 'completed') {
        current.revenue += apt.priceCOP
      }
      
      serviceMap.set(serviceName, current)
    })

    const serviceBreakdown = Array.from(serviceMap.entries())
      .map(([serviceName, data]) => ({
        serviceName,
        count: data.count,
        revenue: data.revenue
      }))
      .sort((a, b) => b.count - a.count)

    // Análisis UTM
    const utmMap = new Map<string, { appointments: number; revenue: number }>()
    
    appointments.forEach(apt => {
      const source = apt.utmSource || 'directo'
      const medium = apt.utmMedium || ''
      const key = `${source}|${medium}`
      
      const current = utmMap.get(key) || { appointments: 0, revenue: 0 }
      current.appointments++
      
      if (apt.status === 'completed') {
        current.revenue += apt.priceCOP
      }
      
      utmMap.set(key, current)
    })

    const utmAnalytics = Array.from(utmMap.entries())
      .map(([key, data]) => {
        const [source, medium] = key.split('|')
        return {
          source,
          medium,
          appointments: data.appointments,
          revenue: data.revenue
        }
      })
      .sort((a, b) => b.revenue - a.revenue)

    // Tendencia mensual
    const monthlyMap = new Map<string, { revenue: number; appointments: number }>()
    
    appointments.forEach(apt => {
      const date = new Date(apt.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })
      
      const current = monthlyMap.get(monthKey) || { revenue: 0, appointments: 0 }
      current.appointments++
      
      if (apt.status === 'completed') {
        current.revenue += apt.priceCOP
      }
      
      monthlyMap.set(monthKey, current)
    })

    const monthlyRevenue = Array.from(monthlyMap.entries())
      .map(([key, data]) => {
        const [year, month] = key.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1)
        const monthName = date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })
        
        return {
          month: monthName,
          revenue: data.revenue,
          appointments: data.appointments
        }
      })
      .sort((a, b) => a.month.localeCompare(b.month))

    const reportData = {
      totalRevenue,
      totalAppointments,
      avgAppointmentValue,
      completionRate,
      cancellationRate,
      serviceBreakdown,
      monthlyRevenue,
      utmAnalytics
    }

    const response: APIResponse<typeof reportData> = {
      success: true,
      data: reportData
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error generating reports:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'REPORTS_ERROR',
        message: 'Error al generar los reportes'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}