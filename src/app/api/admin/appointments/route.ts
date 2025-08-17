import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCalendarEvent, getCalendarConfig } from '@/lib/google-calendar'
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
          message: 'No tienes permisos para crear citas'
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    const body = await request.json()

    // Validar campos requeridos
    const requiredFields = ['serviceId', 'clientName', 'phoneWhatsApp', 'address', 'neighborhood', 'startAt', 'priceCOP']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'MISSING_FIELDS',
          message: `Campos requeridos faltantes: ${missingFields.join(', ')}`
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Verificar que el servicio existe
    const service = await prisma.service.findUnique({
      where: { id: body.serviceId, active: true }
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

    // Calcular hora de fin basada en la duración del servicio
    const startDate = new Date(body.startAt)
    const endDate = new Date(startDate.getTime() + service.durationMin * 60000)

    // Verificar disponibilidad (no hay conflictos con otras citas)
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        status: { in: ['pending', 'confirmed'] },
        OR: [
          {
            startAt: { lt: endDate },
            endAt: { gt: startDate }
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

    // Crear la cita
    const newAppointment = await prisma.appointment.create({
      data: {
        serviceId: body.serviceId,
        clientName: body.clientName.trim(),
        phoneWhatsApp: body.phoneWhatsApp.trim(),
        address: body.address.trim(),
        neighborhood: body.neighborhood.trim(),
        startAt: startDate,
        endAt: endDate,
        status: body.status || 'pending',
        priceCOP: parseInt(body.priceCOP),
        notes: body.notes?.trim() || null,
        bookingPublicToken: crypto.randomUUID()
      },
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

    // Intentar crear evento en Google Calendar automáticamente
    try {
      console.log('📅 Verificando configuración de Google Calendar...')
      
      // Verificar si Google Calendar está configurado y activo
      const calendarConfig = await getCalendarConfig(session.user.id)
      
      if (calendarConfig && calendarConfig.isConnected && calendarConfig.autoCreateEvents) {
        console.log('✅ Google Calendar está configurado - creando evento...')
        
        const googleEvent = await createCalendarEvent(session.user.id, newAppointment)
        
        console.log('🎉 Evento creado en Google Calendar:', {
          appointmentId: newAppointment.id,
          googleEventId: googleEvent.id,
          title: googleEvent.summary
        })
        
        console.log('📊 Detalles del evento:', {
          cliente: newAppointment.clientName,
          servicio: newAppointment.service.name,
          fecha: newAppointment.startAt.toLocaleString('es-CO'),
          direccion: `${newAppointment.address}, ${newAppointment.neighborhood}`
        })
        
      } else {
        console.log('⚠️ Google Calendar no configurado o autoCreate deshabilitado:', {
          isConnected: calendarConfig?.isConnected || false,
          autoCreateEnabled: calendarConfig?.autoCreateEvents || false
        })
      }
    } catch (calendarError) {
      console.error('❌ Error creando evento en Google Calendar:', calendarError)
      // No fallar la creación de la cita por un error del calendario
      // El error se loggea pero la cita se crea exitosamente
    }

    const response: APIResponse<{ appointment: typeof newAppointment }> = {
      success: true,
      data: {
        appointment: newAppointment
      }
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Error creating appointment:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'CREATE_ERROR',
        message: 'Error al crear la cita'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
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
          message: 'No tienes permisos para acceder a esta información'
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    // Construir filtros
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 1)
      
      where.startAt = {
        gte: startDate,
        lt: endDate
      }
    }

    // Obtener citas con información del servicio
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            durationMin: true
          }
        }
      },
      orderBy: {
        startAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Contar total para paginación
    const total = await prisma.appointment.count({ where })

    const response: APIResponse<{
      appointments: typeof appointments
      total: number
      limit: number
      offset: number
    }> = {
      success: true,
      data: {
        appointments,
        total,
        limit,
        offset
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching appointments:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'FETCH_ERROR',
        message: 'Error al obtener las citas'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}