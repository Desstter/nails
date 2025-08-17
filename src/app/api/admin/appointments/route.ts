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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    // Construir filtros
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 1)
      
      where.startAt = {
        gte: startDate,
        lt: endDate
      }
    }

    // Obtener citas con información del servicio
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            durationMin: true
          }
        }
      },
      orderBy: {
        startAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Contar total para paginación
    const total = await prisma.appointment.count({ where })

    const response: APIResponse<{
      appointments: typeof appointments
      total: number
      limit: number
      offset: number
    }> = {
      success: true,
      data: {
        appointments,
        total,
        limit,
        offset
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching appointments:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'FETCH_ERROR',
        message: 'Error al obtener las citas'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}