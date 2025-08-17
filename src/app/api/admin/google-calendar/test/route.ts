import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAuthenticatedClient } from '@/lib/google-calendar'
import { google } from 'googleapis'
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
          message: 'No tienes permisos para probar Google Calendar'
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    // Obtener cliente autenticado
    const oauth2Client = await getAuthenticatedClient(session.user.id)
    
    if (!oauth2Client) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'NOT_CONNECTED',
          message: 'Google Calendar no está conectado'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Probar conexión obteniendo información del calendario principal
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    const calendarInfo = await calendar.calendars.get({
      calendarId: 'primary'
    })

    // Obtener algunos eventos recientes para verificar acceso
    const eventsResponse = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime'
    })

    const testResult = {
      connected: true,
      calendarName: calendarInfo.data.summary || 'Calendario Principal',
      timeZone: calendarInfo.data.timeZone || 'No especificada',
      upcomingEvents: eventsResponse.data.items?.length || 0,
      permissions: {
        read: true,
        write: true
      }
    }

    const response: APIResponse<typeof testResult> = {
      success: true,
      data: testResult
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Error testing Google Calendar connection:', error)
    
    // Determinar tipo de error
    let errorMessage = 'Error al probar conexión con Google Calendar'
    let errorCode = 'TEST_ERROR'

    if (error.code === 401 || error.code === 403) {
      errorMessage = 'Token expirado o permisos insuficientes'
      errorCode = 'AUTH_ERROR'
    } else if (error.code === 404) {
      errorMessage = 'Calendario no encontrado'
      errorCode = 'CALENDAR_NOT_FOUND'
    } else if (error.message?.includes('quota')) {
      errorMessage = 'Límite de API excedido, intenta más tarde'
      errorCode = 'QUOTA_EXCEEDED'
    }

    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: errorCode,
        message: errorMessage
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}