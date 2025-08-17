import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { exchangeCodeForTokens } from '@/lib/google-calendar'
import type { APIResponse } from '@/types/booking'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Obtener código de autorización
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error || !code) {
      return NextResponse.redirect(
        new URL('/admin/calendar?error=authorization_failed', request.url)
      )
    }

    // Intercambiar código por tokens
    await exchangeCodeForTokens(code, session.user.id)

    // Redirigir a configuración de calendario con éxito
    return NextResponse.redirect(
      new URL('/admin/calendar?success=connected', request.url)
    )

  } catch (error) {
    console.error('Error in Google Calendar callback:', error)
    
    return NextResponse.redirect(
      new URL('/admin/calendar?error=connection_failed', request.url)
    )
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
          message: 'No tienes permisos para conectar Google Calendar'
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    const body = await request.json()
    const { code } = body

    if (!code) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'MISSING_CODE',
          message: 'Código de autorización requerido'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Intercambiar código por tokens
    const config = await exchangeCodeForTokens(code, session.user.id)

    const response: APIResponse<{ connected: boolean }> = {
      success: true,
      data: { connected: config.isConnected }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in Google Calendar callback:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'CONNECTION_ERROR',
        message: 'Error al conectar con Google Calendar'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}