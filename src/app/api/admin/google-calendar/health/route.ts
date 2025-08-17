import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAuthenticatedClient } from '@/lib/google-calendar'
import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'
import type { APIResponse } from '@/types/booking'

interface HealthCheck {
  status: 'healthy' | 'warning' | 'critical'
  checks: {
    googleCalendarConnection: {
      status: 'ok' | 'error'
      message: string
      lastChecked: string
    }
    database: {
      status: 'ok' | 'error'
      message: string
      lastChecked: string
    }
    recentSyncActivity: {
      status: 'ok' | 'warning' | 'error'
      message: string
      syncRate: number
      lastSyncedAppointment: string | null
    }
    configuration: {
      status: 'ok' | 'warning'
      message: string
      autoCreateEnabled: boolean
      isConfigured: boolean
    }
  }
  overall: {
    uptime: number
    lastHealthCheck: string
    issues: string[]
    recommendations: string[]
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'UNAUTHORIZED',
          message: 'No tienes permisos para ver el estado de salud'
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    const now = new Date().toISOString()
    const issues: string[] = []
    const recommendations: string[] = []

    // 1. Verificar conexión con Google Calendar
    let googleCalendarCheck = {
      status: 'error' as const,
      message: 'No configurado',
      lastChecked: now
    }

    try {
      const oauth2Client = await getAuthenticatedClient(session.user.id)
      if (oauth2Client) {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
        await calendar.calendars.get({ calendarId: 'primary' })
        googleCalendarCheck = {
          status: 'ok',
          message: 'Conectado y funcionando',
          lastChecked: now
        }
      } else {
        googleCalendarCheck.message = 'No hay token válido'
        issues.push('Google Calendar no está conectado')
        recommendations.push('Conecta tu cuenta de Google Calendar')
      }
    } catch (error: any) {
      googleCalendarCheck = {
        status: 'error',
        message: `Error: ${error.message || 'Desconocido'}`,
        lastChecked: now
      }
      issues.push(`Error en Google Calendar: ${error.message}`)
      if (error.code === 401 || error.code === 403) {
        recommendations.push('Reautoriza tu cuenta de Google Calendar')
      }
    }

    // 2. Verificar base de datos
    let databaseCheck = {
      status: 'ok' as const,
      message: 'Conectada y funcionando',
      lastChecked: now
    }

    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (error: any) {
      databaseCheck = {
        status: 'error',
        message: `Error de conexión: ${error.message}`,
        lastChecked: now
      }
      issues.push('Error de conexión a la base de datos')
      recommendations.push('Verifica la configuración de la base de datos')
    }

    // 3. Verificar actividad de sincronización reciente
    let recentSyncCheck = {
      status: 'ok' as const,
      message: 'Sincronización activa',
      syncRate: 100,
      lastSyncedAppointment: null as string | null
    }

    try {
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)

      const totalRecent = await prisma.appointment.count({
        where: { createdAt: { gte: lastWeek } }
      })

      const syncedRecent = await prisma.appointment.count({
        where: {
          createdAt: { gte: lastWeek },
          googleEventId: { not: null }
        }
      })

      const lastSynced = await prisma.appointment.findFirst({
        where: { googleEventId: { not: null } },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })

      recentSyncCheck.syncRate = totalRecent > 0 ? Math.round((syncedRecent / totalRecent) * 100) : 100
      recentSyncCheck.lastSyncedAppointment = lastSynced?.createdAt.toISOString() || null

      if (recentSyncCheck.syncRate < 80) {
        recentSyncCheck.status = 'warning'
        recentSyncCheck.message = `Tasa de sincronización baja: ${recentSyncCheck.syncRate}%`
        issues.push(`Tasa de sincronización baja (${recentSyncCheck.syncRate}%)`)
        recommendations.push('Revisa la configuración de sincronización automática')
      } else if (recentSyncCheck.syncRate < 50) {
        recentSyncCheck.status = 'error'
        recentSyncCheck.message = `Tasa de sincronización crítica: ${recentSyncCheck.syncRate}%`
      }

      if (!lastSynced) {
        recentSyncCheck.status = 'warning'
        recentSyncCheck.message = 'No hay citas sincronizadas recientemente'
        recommendations.push('Verifica que la creación automática esté habilitada')
      }
    } catch (error) {
      recentSyncCheck.status = 'error'
      recentSyncCheck.message = 'Error al verificar sincronización'
      issues.push('Error al verificar actividad de sincronización')
    }

    // 4. Verificar configuración
    let configurationCheck = {
      status: 'ok' as const,
      message: 'Configuración óptima',
      autoCreateEnabled: false,
      isConfigured: false
    }

    try {
      const config = await prisma.googleCalendarConfig.findUnique({
        where: { userId: session.user.id }
      })

      configurationCheck.isConfigured = !!config?.isConnected
      configurationCheck.autoCreateEnabled = !!config?.autoCreateEvents

      if (!configurationCheck.isConfigured) {
        configurationCheck.status = 'warning'
        configurationCheck.message = 'Google Calendar no configurado'
        recommendations.push('Configura la integración con Google Calendar')
      } else if (!configurationCheck.autoCreateEnabled) {
        configurationCheck.status = 'warning'
        configurationCheck.message = 'Creación automática deshabilitada'
        recommendations.push('Habilita la creación automática de eventos')
      }
    } catch (error) {
      configurationCheck.status = 'warning'
      configurationCheck.message = 'Error al verificar configuración'
    }

    // Determinar estado general
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy'

    if (googleCalendarCheck.status === 'error' || databaseCheck.status === 'error' || recentSyncCheck.status === 'error') {
      overallStatus = 'critical'
    } else if (googleCalendarCheck.status === 'ok' && databaseCheck.status === 'ok' && issues.length === 0) {
      overallStatus = 'healthy'
    } else {
      overallStatus = 'warning'
    }

    const healthCheck: HealthCheck = {
      status: overallStatus,
      checks: {
        googleCalendarConnection: googleCalendarCheck,
        database: databaseCheck,
        recentSyncActivity: recentSyncCheck,
        configuration: configurationCheck
      },
      overall: {
        uptime: Date.now(), // Placeholder - en producción sería uptime real
        lastHealthCheck: now,
        issues,
        recommendations
      }
    }

    const response: APIResponse<HealthCheck> = {
      success: true,
      data: healthCheck
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error performing health check:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'HEALTH_CHECK_ERROR',
        message: 'Error al verificar estado de salud del sistema'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}