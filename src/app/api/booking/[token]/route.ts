// API para gestionar citas existentes usando token público
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { APIResponse, Appointment } from '@/types/booking'

interface RouteParams {
  params: Promise<{
    token: string
  }>
}

// GET: Obtener detalles de una cita
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params

    if (!token) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'MISSING_TOKEN',
          message: 'Token de cita requerido'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    const appointment = await prisma.appointment.findUnique({
      where: {
        bookingPublicToken: token
      },
      include: {
        service: true
      }
    })

    if (!appointment) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'APPOINTMENT_NOT_FOUND',
          message: 'Cita no encontrada'
        }
      }
      return NextResponse.json(errorResponse, { status: 404 })
    }

    const response: APIResponse<{ appointment: typeof appointment }> = {
      success: true,
      data: {
        appointment
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching appointment:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'FETCH_ERROR',
        message: 'Error al consultar la cita'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// PATCH: Actualizar una cita (cancelar, modificar notas, etc.)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params
    const body = await request.json()

    if (!token) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'MISSING_TOKEN',
          message: 'Token de cita requerido'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Verificar que la cita existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: {
        bookingPublicToken: token
      },
      include: {
        service: true
      }
    })

    if (!existingAppointment) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'APPOINTMENT_NOT_FOUND',
          message: 'Cita no encontrada'
        }
      }
      return NextResponse.json(errorResponse, { status: 404 })
    }

    // Solo permitir ciertas actualizaciones
    const allowedUpdates: { [key: string]: any } = {}
    
    if (body.status && ['cancelled'].includes(body.status)) {
      // Solo permitir cancelación por parte del cliente
      allowedUpdates.status = body.status
    }
    
    if (body.notes !== undefined) {
      allowedUpdates.notes = body.notes?.trim() || null
    }

    // Verificar que la cita se puede modificar (no está en el pasado ni ya cancelada/completada)
    const now = new Date()
    if (existingAppointment.startAt < now) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'CANNOT_MODIFY_PAST',
          message: 'No se pueden modificar citas pasadas'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    if (['cancelled', 'completed'].includes(existingAppointment.status)) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'CANNOT_MODIFY_FINALIZED',
          message: 'No se pueden modificar citas canceladas o completadas'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Actualizar la cita
    const updatedAppointment = await prisma.appointment.update({
      where: {
        bookingPublicToken: token
      },
      data: allowedUpdates,
      include: {
        service: true
      }
    })

    const response: APIResponse<{ appointment: typeof updatedAppointment }> = {
      success: true,
      data: {
        appointment: updatedAppointment
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error updating appointment:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'UPDATE_ERROR',
        message: 'Error al actualizar la cita'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}