import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAuthenticatedClient } from '@/lib/google-calendar'
import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'
import type { APIResponse } from '@/types/booking'

interface ImportedEvent {
  googleEventId: string
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  status: 'imported' | 'skipped' | 'error'
  reason?: string
}

interface SyncImportResult {
  totalEventsFound: number
  imported: ImportedEvent[]
  skipped: ImportedEvent[]
  errors: ImportedEvent[]
  summary: {
    importedCount: number
    skippedCount: number
    errorCount: number
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
          message: 'No tienes permisos para sincronizar desde Google Calendar'
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    // Verificar que la sincronización bidireccional esté habilitada
    const config = await prisma.googleCalendarConfig.findUnique({
      where: { userId: session.user.id }
    })

    if (!config?.isConnected) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'NOT_CONFIGURED',
          message: 'Google Calendar no está configurado'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    if (!config.syncBidirectional) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'BIDIRECTIONAL_DISABLED',
          message: 'La sincronización bidireccional no está habilitada'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Obtener cliente autenticado
    const oauth2Client = await getAuthenticatedClient(session.user.id)
    
    if (!oauth2Client) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'NOT_CONNECTED',
          message: 'No se pudo autenticar con Google Calendar'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Obtener parámetros de la solicitud
    const body = await request.json()
    const daysBack = body.daysBack || 7
    const daysForward = body.daysForward || 30

    // Calcular rango de fechas
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + daysForward)
    endDate.setHours(23, 59, 59, 999)

    // Obtener eventos de Google Calendar
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    const eventsResponse = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250
    })

    const googleEvents = eventsResponse.data.items || []
    
    // Obtener citas existentes en el rango de fechas
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        startAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        googleEventId: true,
        startAt: true,
        endAt: true,
        clientName: true
      }
    })

    const result: SyncImportResult = {
      totalEventsFound: googleEvents.length,
      imported: [],
      skipped: [],
      errors: [],
      summary: {
        importedCount: 0,
        skippedCount: 0,
        errorCount: 0
      }
    }

    // Procesar cada evento de Google Calendar
    for (const event of googleEvents) {
      try {
        // Validar que el evento tenga la información mínima necesaria
        if (!event.id || !event.start?.dateTime || !event.end?.dateTime || !event.summary) {
          result.errors.push({
            googleEventId: event.id || 'unknown',
            title: event.summary || 'Sin título',
            startTime: event.start?.dateTime || '',
            endTime: event.end?.dateTime || '',
            status: 'error',
            reason: 'Evento incompleto (falta información requerida)'
          })
          continue
        }

        // Verificar si ya existe una cita con este googleEventId
        const existingByEventId = existingAppointments.find(apt => apt.googleEventId === event.id)
        
        if (existingByEventId) {
          result.skipped.push({
            googleEventId: event.id,
            title: event.summary,
            startTime: event.start.dateTime,
            endTime: event.end.dateTime,
            location: event.location,
            status: 'skipped',
            reason: 'Ya existe una cita con este evento de Google'
          })
          continue
        }

        // Verificar si ya existe una cita en el mismo horario
        const eventStart = new Date(event.start.dateTime)
        const eventEnd = new Date(event.end.dateTime)
        
        const conflictingAppointment = existingAppointments.find(apt => {
          const aptStart = new Date(apt.startAt)
          const aptEnd = new Date(apt.endAt)
          
          // Verificar superposición de horarios
          return (eventStart < aptEnd && eventEnd > aptStart)
        })

        if (conflictingAppointment) {
          result.skipped.push({
            googleEventId: event.id,
            title: event.summary,
            startTime: event.start.dateTime,
            endTime: event.end.dateTime,
            location: event.location,
            status: 'skipped',
            reason: `Conflicto de horario con cita existente (${conflictingAppointment.clientName})`
          })
          continue
        }

        // Analizar el título del evento para extraer información
        const eventTitle = event.summary
        const eventDescription = event.description || ''
        
        // Buscar patrones comunes para identificar si es una cita de manicure
        const isNailsRelated = /\b(manicure|pedicure|u[ñn]as|nail|semi\s*permanent|acr[íi]lic|gel)\b/i.test(`${eventTitle} ${eventDescription}`)
        
        if (!isNailsRelated) {
          result.skipped.push({
            googleEventId: event.id,
            title: event.summary,
            startTime: event.start.dateTime,
            endTime: event.end.dateTime,
            location: event.location,
            status: 'skipped',
            reason: 'No parece ser una cita relacionada con manicure/pedicure'
          })
          continue
        }

        // Extraer información del cliente del título
        let clientName = 'Cliente importado'
        const titleParts = eventTitle.split(/[-–—]|\s+con\s+|\s+para\s+/i)
        if (titleParts.length > 1) {
          clientName = titleParts[titleParts.length - 1].trim()
        }

        // Determinar el servicio basado en el título
        let serviceId = ''
        const services = await prisma.service.findMany({
          where: { active: true },
          orderBy: { name: 'asc' }
        })

        // Buscar servicio que coincida con el título
        const matchingService = services.find(service => {
          const serviceName = service.name.toLowerCase()
          const eventTitleLower = eventTitle.toLowerCase()
          return eventTitleLower.includes(serviceName.toLowerCase()) ||
                 serviceName.includes('semi') && eventTitleLower.includes('semi') ||
                 serviceName.includes('acr') && eventTitleLower.includes('acr') ||
                 serviceName.includes('pedicure') && eventTitleLower.includes('pedicure')
        })

        if (!matchingService) {
          // Usar el primer servicio activo como fallback
          serviceId = services[0]?.id || ''
          if (!serviceId) {
            result.errors.push({
              googleEventId: event.id,
              title: event.summary,
              startTime: event.start.dateTime,
              endTime: event.end.dateTime,
              status: 'error',
              reason: 'No hay servicios activos configurados en el sistema'
            })
            continue
          }
        } else {
          serviceId = matchingService.id
        }

        // Crear la cita importada
        const durationMin = Math.round((eventEnd.getTime() - eventStart.getTime()) / (1000 * 60))
        
        const newAppointment = await prisma.appointment.create({
          data: {
            serviceId: serviceId,
            clientName: clientName,
            phoneWhatsApp: '+57 000 000 0000', // Placeholder
            address: event.location || 'Dirección por confirmar',
            neighborhood: 'Por confirmar',
            startAt: eventStart,
            endAt: eventEnd,
            status: 'confirmed',
            priceCOP: matchingService?.basePriceCOP || 50000, // Precio base
            notes: `Importado de Google Calendar: ${eventDescription || 'Sin notas adicionales'}`,
            googleEventId: event.id,
            calendarInviteSent: false
          }
        })

        result.imported.push({
          googleEventId: event.id,
          title: event.summary,
          description: event.description,
          startTime: event.start.dateTime,
          endTime: event.end.dateTime,
          location: event.location,
          status: 'imported'
        })

        console.log(`✅ Cita importada: ${eventTitle} - ${clientName} (${eventStart.toLocaleString('es-CO')})`)

      } catch (error) {
        console.error(`Error procesando evento ${event.id}:`, error)
        result.errors.push({
          googleEventId: event.id || 'unknown',
          title: event.summary || 'Sin título',
          startTime: event.start?.dateTime || '',
          endTime: event.end?.dateTime || '',
          status: 'error',
          reason: `Error al crear cita: ${error.message}`
        })
      }
    }

    // Actualizar contadores
    result.summary = {
      importedCount: result.imported.length,
      skippedCount: result.skipped.length,
      errorCount: result.errors.length
    }

    console.log(`🔄 Sincronización completada: ${result.summary.importedCount} importadas, ${result.summary.skippedCount} omitidas, ${result.summary.errorCount} errores`)

    const response: APIResponse<SyncImportResult> = {
      success: true,
      data: result
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in sync import:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'SYNC_IMPORT_ERROR',
        message: `Error al sincronizar desde Google Calendar: ${error.message}`
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}