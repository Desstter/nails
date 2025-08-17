import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCalendarConfig } from '@/lib/google-calendar'
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
          message: 'No tienes permisos para ver el estado del calendario'
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    // Obtener configuración de calendario
    const config = await getCalendarConfig(session.user.id)

    const calendarStatus = {
      isConnected: config?.isConnected || false,
      autoCreateEvents: config?.autoCreateEvents || false,
      sendClientInvites: config?.sendClientInvites || false,
      syncBidirectional: config?.syncBidirectional || false,
      lastConnection: config?.updatedAt || null
    }

    const response: APIResponse<typeof calendarStatus> = {
      success: true,
      data: calendarStatus
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error getting calendar status:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'STATUS_ERROR',
        message: 'Error al obtener estado del calendario'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}