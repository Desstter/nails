// API para crear reservas reales con validación atómica
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCalendarEvent } from '@/lib/google-calendar'
import { sendAppointmentConfirmation } from '@/lib/whatsapp-notifications'
import type { APIResponse, CreateAppointmentRequest } from '@/types/booking'

export async function POST(request: NextRequest) {
  try {
    const body: CreateAppointmentRequest = await request.json()
    
    // Validaciones de entrada
    const { 
      serviceId, 
      startAt, 
      clientName, 
      phoneWhatsApp, 
      address, 
      neighborhood,
      notes,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm
    } = body

    // Validar campos requeridos
    if (!serviceId || !startAt || !clientName || !phoneWhatsApp || !address || !neighborhood) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'MISSING_FIELDS',
          message: 'Todos los campos requeridos deben estar completos'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Validar formato de fecha
    const startDateTime = new Date(startAt)
    if (isNaN(startDateTime.getTime())) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'INVALID_DATE',
          message: 'Formato de fecha/hora inválido'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Verificar que la fecha no sea en el pasado
    const now = new Date()
    const colombiaNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }))
    
    if (startDateTime < colombiaNow) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'PAST_DATE',
          message: 'No se pueden hacer reservas para fechas pasadas'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Verificar que el servicio existe y está activo
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

    // Calcular fecha/hora de fin
    const endDateTime = new Date(startDateTime.getTime() + service.durationMin * 60 * 1000)

    // VALIDACIÓN ATÓMICA: Verificar disponibilidad del slot en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verificar que no haya choques con citas existentes
      const conflictingAppointments = await tx.appointment.findMany({
        where: {
          AND: [
            {
              OR: [
                // El nuevo slot inicia durante una cita existente
                {
                  AND: [
                    { startAt: { lte: startDateTime } },
                    { endAt: { gt: startDateTime } }
                  ]
                },
                // El nuevo slot termina durante una cita existente  
                {
                  AND: [
                    { startAt: { lt: endDateTime } },
                    { endAt: { gte: endDateTime } }
                  ]
                },
                // El nuevo slot envuelve completamente una cita existente
                {
                  AND: [
                    { startAt: { gte: startDateTime } },
                    { endAt: { lte: endDateTime } }
                  ]
                }
              ]
            },
            {
              status: { in: ['pending', 'confirmed'] }
            }
          ]
        }
      })

      if (conflictingAppointments.length > 0) {
        throw new Error('SLOT_NOT_AVAILABLE')
      }

      // 2. Verificar bloqueos de tiempo
      const conflictingBlocks = await tx.blockTime.findMany({
        where: {
          AND: [
            {
              OR: [
                {
                  AND: [
                    { startAt: { lte: startDateTime } },
                    { endAt: { gt: startDateTime } }
                  ]
                },
                {
                  AND: [
                    { startAt: { lt: endDateTime } },
                    { endAt: { gte: endDateTime } }
                  ]
                },
                {
                  AND: [
                    { startAt: { gte: startDateTime } },
                    { endAt: { lte: endDateTime } }
                  ]
                }
              ]
            },
            { active: true }
          ]
        }
      })

      if (conflictingBlocks.length > 0) {
        throw new Error('SLOT_BLOCKED')
      }

      // 3. Calcular precio final (con descuento de $10,000 para nuevas clientas)
      const finalPrice = Math.max(0, service.basePriceCOP - 10000)

      // 4. Crear la cita
      const appointment = await tx.appointment.create({
        data: {
          serviceId,
          clientName: clientName.trim(),
          phoneWhatsApp: phoneWhatsApp.trim(),
          address: address.trim(),
          neighborhood: neighborhood.trim(),
          startAt: startDateTime,
          endAt: endDateTime,
          status: 'confirmed',
          priceCOP: finalPrice,
          notes: notes?.trim() || null,
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null,
          utmContent: utmContent || null,
          utmTerm: utmTerm || null
        },
        include: {
          service: true
        }
      })

      return appointment
    })

    // Intentar crear evento en Google Calendar (no bloqueante)
    try {
      // Buscar admin user (assumimos que hay uno solo con role 'admin')
      const adminUser = await prisma.user.findFirst({
        where: { role: 'admin' },
        include: { googleCalendarConfig: true }
      })

      if (adminUser?.googleCalendarConfig?.isConnected && adminUser.googleCalendarConfig.autoCreateEvents) {
        await createCalendarEvent(adminUser.id, result)
        console.log(`✅ Google Calendar event created for appointment ${result.id}`)
      }
    } catch (calendarError) {
      // Log del error pero no falla la reserva
      console.error('⚠️ Google Calendar event creation failed:', calendarError)
    }

    // Enviar confirmación por WhatsApp (no bloqueante)
    try {
      const confirmationSent = await sendAppointmentConfirmation(result)
      if (confirmationSent) {
        console.log(`✅ WhatsApp confirmation sent for appointment ${result.id}`)
      } else {
        console.log(`⚠️ WhatsApp confirmation failed for appointment ${result.id}`)
      }
    } catch (whatsappError) {
      // Log del error pero no falla la reserva
      console.error('⚠️ WhatsApp confirmation failed:', whatsappError)
    }

    // Respuesta exitosa
    const successResponse: APIResponse<{
      appointmentId: string
      token: string
      appointment: typeof result
    }> = {
      success: true,
      data: {
        appointmentId: result.id,
        token: result.bookingPublicToken,
        appointment: result
      }
    }

    return NextResponse.json(successResponse, { status: 201 })

  } catch (error) {
    console.error('Error creating appointment:', error)
    
    // Errores específicos de validación
    if (error instanceof Error) {
      if (error.message === 'SLOT_NOT_AVAILABLE') {
        const errorResponse: APIResponse<never> = {
          success: false,
          error: {
            error: 'SLOT_NOT_AVAILABLE',
            message: 'El horario seleccionado ya no está disponible. Por favor, elige otro horario.'
          }
        }
        return NextResponse.json(errorResponse, { status: 409 })
      }
      
      if (error.message === 'SLOT_BLOCKED') {
        const errorResponse: APIResponse<never> = {
          success: false,
          error: {
            error: 'SLOT_BLOCKED',
            message: 'El horario seleccionado está bloqueado. Por favor, elige otro horario.'
          }
        }
        return NextResponse.json(errorResponse, { status: 409 })
      }
    }
    
    // Error genérico
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'BOOKING_ERROR',
        message: 'Error al procesar la reserva. Intenta nuevamente.'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}