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

    // Obtener todos los bloques ordenados por fecha
    const blocks = await prisma.blockTime.findMany({
      orderBy: {
        startAt: 'desc'
      }
    })

    const response: APIResponse<{ blocks: typeof blocks }> = {
      success: true,
      data: { blocks }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching blocks:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'FETCH_ERROR',
        message: 'Error al obtener los bloqueos'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'UNAUTHORIZED',
          message: 'No tienes permisos para realizar esta acción'
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    const body = await request.json()
    const { startAt, endAt, reason } = body

    // Validaciones
    if (!startAt || !endAt) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'MISSING_FIELDS',
          message: 'Fecha de inicio y fin son requeridas'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    const startDate = new Date(startAt)
    const endDate = new Date(endAt)

    if (endDate <= startDate) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'INVALID_DATE_RANGE',
          message: 'La fecha de fin debe ser posterior a la fecha de inicio'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Verificar si hay conflictos con citas existentes
    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        AND: [
          {
            OR: [
              { AND: [{ startAt: { lte: startDate } }, { endAt: { gt: startDate } }] },
              { AND: [{ startAt: { lt: endDate } }, { endAt: { gte: endDate } }] },
              { AND: [{ startAt: { gte: startDate } }, { endAt: { lte: endDate } }] }
            ]
          },
          { status: { in: ['pending', 'confirmed'] } }
        ]
      },
      include: {
        service: { select: { name: true } }
      }
    })

    if (conflictingAppointments.length > 0) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'CONFLICTING_APPOINTMENTS',
          message: `Hay ${conflictingAppointments.length} cita(s) programada(s) en este período. Cancélalas primero o ajusta las fechas del bloqueo.`
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Crear el bloqueo
    const newBlock = await prisma.blockTime.create({
      data: {
        startAt: startDate,
        endAt: endDate,
        reason: reason?.trim() || null,
        active: true
      }
    })

    const response: APIResponse<{ block: typeof newBlock }> = {
      success: true,
      data: { block: newBlock }
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Error creating block:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'CREATE_ERROR',
        message: 'Error al crear el bloqueo'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}