import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { disconnectGoogleCalendar } from '@/lib/google-calendar'
import type { APIResponse } from '@/types/booking'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'UNAUTHORIZED',
          message: 'No tienes permisos para desconectar Google Calendar'
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    // Desconectar Google Calendar
    await disconnectGoogleCalendar(session.user.id)

    const response: APIResponse<{ disconnected: boolean }> = {
      success: true,
      data: { disconnected: true }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'DISCONNECT_ERROR',
        message: 'Error al desconectar Google Calendar'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}