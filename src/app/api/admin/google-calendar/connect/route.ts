import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAuthUrl } from '@/lib/google-calendar'
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
          message: 'No tienes permisos para conectar Google Calendar'
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    // Generar URL de autorización
    const authUrl = getAuthUrl()

    const response: APIResponse<{ authUrl: string }> = {
      success: true,
      data: { authUrl }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error generating Google auth URL:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'AUTH_URL_ERROR',
        message: 'Error al generar URL de autorización'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}