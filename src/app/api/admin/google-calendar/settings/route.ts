import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { APIResponse } from '@/types/booking'

export async function PATCH(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'UNAUTHORIZED',
          message: 'No tienes permisos para actualizar configuración'
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    const body = await request.json()
    const { autoCreateEvents, sendClientInvites, syncBidirectional } = body

    // Validar que al menos un campo esté presente
    if (autoCreateEvents === undefined && sendClientInvites === undefined && syncBidirectional === undefined) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'MISSING_FIELDS',
          message: 'Al menos un campo de configuración es requerido'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Preparar datos de actualización
    const updateData: any = {}
    if (autoCreateEvents !== undefined) updateData.autoCreateEvents = autoCreateEvents
    if (sendClientInvites !== undefined) updateData.sendClientInvites = sendClientInvites
    if (syncBidirectional !== undefined) updateData.syncBidirectional = syncBidirectional

    // Actualizar configuración
    const config = await prisma.googleCalendarConfig.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        isConnected: false,
        ...updateData
      }
    })

    const response: APIResponse<{ success: boolean; config: any }> = {
      success: true,
      data: { 
        success: true,
        config: {
          autoCreateEvents: config.autoCreateEvents,
          sendClientInvites: config.sendClientInvites,
          syncBidirectional: config.syncBidirectional
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error updating Google Calendar settings:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'UPDATE_ERROR',
        message: 'Error al actualizar configuración'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}