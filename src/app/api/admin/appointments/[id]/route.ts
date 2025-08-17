import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateCalendarEvent, deleteCalendarEvent, getCalendarConfig } from '@/lib/google-calendar'
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

    // Campos adicionales para edición completa
    if (body.clientName?.trim()) {
      allowedUpdates.clientName = body.clientName.trim()
    }

    if (body.phoneWhatsApp?.trim()) {
      allowedUpdates.phoneWhatsApp = body.phoneWhatsApp.trim()
    }

    if (body.address?.trim()) {
      allowedUpdates.address = body.address.trim()
    }

    if (body.neighborhood?.trim()) {
      allowedUpdates.neighborhood = body.neighborhood.trim()
    }

    // Cambio de servicio y/o fecha
    if (body.serviceId || body.startAt) {
      const serviceId = body.serviceId || existingAppointment.serviceId
      const startAt = body.startAt ? new Date(body.startAt) : existingAppointment.startAt

      // Verificar que el servicio existe si se está cambiando
      if (body.serviceId && body.serviceId !== existingAppointment.serviceId) {
        const service = await prisma.service.findUnique({
          where: { id: serviceId, active: true }
        })

        if (!service) {
          const errorResponse: APIResponse<never> = {
            success: false,
            error: {
              error: 'SERVICE_NOT_FOUND',
              message: 'Servicio no encontrado o inactivo'
            }
          }
          return NextResponse.json(errorResponse, { status: 404 })
        }

        // Calcular nueva hora de fin basada en el nuevo servicio
        const endAt = new Date(startAt.getTime() + service.durationMin * 60000)
        allowedUpdates.serviceId = serviceId
        allowedUpdates.startAt = startAt
        allowedUpdates.endAt = endAt
      } else if (body.startAt) {
        // Solo cambio de fecha/hora, mantener duración del servicio actual
        const endAt = new Date(startAt.getTime() + existingAppointment.service.durationMin * 60000)
        allowedUpdates.startAt = startAt
        allowedUpdates.endAt = endAt
      }

      // Verificar conflictos de horario (excluyendo la cita actual)
      if (allowedUpdates.startAt && allowedUpdates.endAt) {
        const conflictingAppointment = await prisma.appointment.findFirst({
          where: {
            id: { not: id },
            status: { in: ['pending', 'confirmed'] },
            OR: [
              {
                startAt: { lt: allowedUpdates.endAt },
                endAt: { gt: allowedUpdates.startAt }
              }
            ]
          }
        })

        if (conflictingAppointment) {
          const errorResponse: APIResponse<never> = {
            success: false,
            error: {
              error: 'TIME_CONFLICT',
              message: 'Ya existe una cita en ese horario'
            }
          }
          return NextResponse.json(errorResponse, { status: 409 })
        }
      }
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

    // Actualizar evento en Google Calendar si está configurado
    try {
      console.log('📅 Verificando si actualizar evento en Google Calendar...')
      
      const calendarConfig = await getCalendarConfig(session.user.id)
      
      if (calendarConfig && calendarConfig.isConnected && updatedAppointment.googleEventId) {
        console.log('✅ Actualizando evento en Google Calendar:', updatedAppointment.googleEventId)
        
        await updateCalendarEvent(
          session.user.id,
          updatedAppointment.googleEventId,
          updatedAppointment
        )
        
        console.log('🎉 Evento actualizado en Google Calendar:', {
          appointmentId: updatedAppointment.id,
          googleEventId: updatedAppointment.googleEventId,
          cliente: updatedAppointment.clientName,
          servicio: updatedAppointment.service.name
        })
        
      } else {
        console.log('⚠️ No se puede actualizar evento:', {
          isConnected: calendarConfig?.isConnected || false,
          hasGoogleEventId: !!updatedAppointment.googleEventId
        })
      }
    } catch (calendarError) {
      console.error('❌ Error actualizando evento en Google Calendar:', calendarError)
      // No fallar la actualización de la cita por un error del calendario
    }

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

    // Eliminar evento de Google Calendar si existe
    try {
      console.log('📅 Verificando si eliminar evento de Google Calendar...')
      
      const calendarConfig = await getCalendarConfig(session.user.id)
      
      if (calendarConfig && calendarConfig.isConnected && existingAppointment.googleEventId) {
        console.log('🗑️ Eliminando evento de Google Calendar:', existingAppointment.googleEventId)
        
        await deleteCalendarEvent(session.user.id, existingAppointment.googleEventId)
        
        console.log('✅ Evento eliminado de Google Calendar:', {
          appointmentId: existingAppointment.id,
          googleEventId: existingAppointment.googleEventId,
          cliente: existingAppointment.clientName
        })
        
      } else {
        console.log('⚠️ No se puede eliminar evento:', {
          isConnected: calendarConfig?.isConnected || false,
          hasGoogleEventId: !!existingAppointment.googleEventId
        })
      }
    } catch (calendarError) {
      console.error('❌ Error eliminando evento de Google Calendar:', calendarError)
      // No fallar la eliminación de la cita por un error del calendario
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