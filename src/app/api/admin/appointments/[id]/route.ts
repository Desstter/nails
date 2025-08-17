import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { APIResponse } from '@/types/booking'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params
    const body = await request.json()

    if (!id) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'MISSING_ID',
          message: 'ID de cita requerido'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Verificar que la cita existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: { service: true }
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

    // Validar campos que se pueden actualizar
    const allowedUpdates: { [key: string]: any } = {}
    
    if (body.status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(body.status)) {
      allowedUpdates.status = body.status
    }
    
    if (body.notes !== undefined) {
      allowedUpdates.notes = body.notes?.trim() || null
    }

    if (body.priceCOP && typeof body.priceCOP === 'number' && body.priceCOP > 0) {
      allowedUpdates.priceCOP = body.priceCOP
    }

    // Actualizar la cita
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: allowedUpdates,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            durationMin: true
          }
        }
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params

    if (!id) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'MISSING_ID',
          message: 'ID de cita requerido'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Verificar que la cita existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
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

    // Eliminar la cita (solo en casos extremos)
    await prisma.appointment.delete({
      where: { id }
    })

    const response: APIResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Cita eliminada exitosamente'
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error deleting appointment:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'DELETE_ERROR',
        message: 'Error al eliminar la cita'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}