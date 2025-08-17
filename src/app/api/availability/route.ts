// API para obtener disponibilidad de horarios
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { AvailabilityResponse, TimeSlot, APIResponse } from '@/types/booking'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const dateStr = searchParams.get('date')

    // Validaciones
    if (!serviceId || !dateStr) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'MISSING_PARAMETERS',
          message: 'serviceId y date son requeridos'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(dateStr)) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'INVALID_DATE_FORMAT',
          message: 'Formato de fecha debe ser YYYY-MM-DD'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Verificar que el servicio existe
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

    // Obtener fecha en zona horaria Colombia
    const requestDate = new Date(dateStr + 'T00:00:00.000-05:00') // Colombia UTC-5
    const today = new Date()
    const colombiaToday = new Date(today.toLocaleString("en-US", { timeZone: "America/Bogota" }))

    // No permitir fechas pasadas
    if (requestDate < new Date(colombiaToday.toDateString())) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'PAST_DATE',
          message: 'No se pueden consultar fechas pasadas'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Obtener día de la semana (0=domingo, 1=lunes, etc.)
    const weekday = requestDate.getDay()

    // Buscar horarios laborales para ese día
    const businessHour = await prisma.businessHour.findUnique({
      where: { 
        weekday: weekday,
        active: true 
      }
    })

    if (!businessHour) {
      // No hay horarios laborales para este día
      const response: APIResponse<AvailabilityResponse> = {
        success: true,
        data: {
          date: dateStr,
          serviceId,
          slots: [],
          businessHours: undefined
        }
      }
      return NextResponse.json(response)
    }

    // Obtener citas existentes para este día y servicio (para evitar choques)
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        startAt: {
          gte: new Date(requestDate.toDateString()), // Inicio del día
          lt: new Date(new Date(requestDate.getTime() + 24 * 60 * 60 * 1000).toDateString()) // Inicio del día siguiente
        },
        status: {
          in: ['pending', 'confirmed'] // Solo considerar citas activas
        }
      },
      select: {
        startAt: true,
        endAt: true,
        serviceId: true
      }
    })

    // Obtener bloqueos de tiempo para este día
    const blockTimes = await prisma.blockTime.findMany({
      where: {
        startAt: {
          lte: new Date(new Date(requestDate.getTime() + 24 * 60 * 60 * 1000).toDateString()) // Antes del final del día
        },
        endAt: {
          gte: new Date(requestDate.toDateString()) // Después del inicio del día
        },
        active: true
      },
      select: {
        startAt: true,
        endAt: true,
        reason: true
      }
    })

    // Generar slots de tiempo en intervalos de 15 minutos con validación anti-choques
    const slots = generateTimeSlots(
      businessHour.startTime,
      businessHour.endTime,
      service.durationMin,
      requestDate,
      colombiaToday,
      existingAppointments,
      blockTimes
    )

    const response: APIResponse<AvailabilityResponse> = {
      success: true,
      data: {
        date: dateStr,
        serviceId,
        slots,
        businessHours: {
          startTime: businessHour.startTime,
          endTime: businessHour.endTime
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching availability:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'AVAILABILITY_ERROR',
        message: 'Error al consultar disponibilidad'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

function generateTimeSlots(
  startTime: string,
  endTime: string,
  serviceDurationMin: number,
  requestDate: Date,
  currentDate: Date,
  existingAppointments: Array<{ startAt: Date; endAt: Date; serviceId: string }>,
  blockTimes: Array<{ startAt: Date; endAt: Date; reason: string | null }>
): TimeSlot[] {
  const slots: TimeSlot[] = []
  
  // Convertir horarios a minutos
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  // Generar slots cada 15 minutos
  const slotInterval = 15
  
  for (let minutes = startMinutes; minutes + serviceDurationMin <= endMinutes; minutes += slotInterval) {
    const slotHour = Math.floor(minutes / 60)
    const slotMin = minutes % 60
    
    const timeStr = `${slotHour.toString().padStart(2, '0')}:${slotMin.toString().padStart(2, '0')}`
    
    // Crear fecha/hora del slot propuesto
    const slotStartTime = new Date(requestDate)
    slotStartTime.setHours(slotHour, slotMin, 0, 0)
    
    const slotEndTime = new Date(slotStartTime.getTime() + serviceDurationMin * 60 * 1000)
    
    let available = true
    let reason = undefined
    
    // Validación 1: Para hoy, solo mostrar horarios futuros (al menos 2 horas de anticipación)
    if (requestDate.toDateString() === currentDate.toDateString()) {
      const twoHoursFromNow = new Date(currentDate.getTime() + 2 * 60 * 60 * 1000)
      
      if (slotStartTime < twoHoursFromNow) {
        available = false
        reason = 'Se requieren al menos 2 horas de anticipación'
      }
    }
    
    // Validación 2: Verificar choques con citas existentes
    if (available) {
      for (const appointment of existingAppointments) {
        const appointmentStart = new Date(appointment.startAt)
        const appointmentEnd = new Date(appointment.endAt)
        
        // Verificar si hay solapamiento
        if (
          (slotStartTime >= appointmentStart && slotStartTime < appointmentEnd) ||
          (slotEndTime > appointmentStart && slotEndTime <= appointmentEnd) ||
          (slotStartTime <= appointmentStart && slotEndTime >= appointmentEnd)
        ) {
          available = false
          reason = 'Horario ya reservado'
          break
        }
      }
    }
    
    // Validación 3: Verificar bloqueos de tiempo
    if (available) {
      for (const blockTime of blockTimes) {
        const blockStart = new Date(blockTime.startAt)
        const blockEnd = new Date(blockTime.endAt)
        
        // Verificar si hay solapamiento con bloqueo
        if (
          (slotStartTime >= blockStart && slotStartTime < blockEnd) ||
          (slotEndTime > blockStart && slotEndTime <= blockEnd) ||
          (slotStartTime <= blockStart && slotEndTime >= blockEnd)
        ) {
          available = false
          reason = blockTime.reason || 'Horario no disponible'
          break
        }
      }
    }
    
    slots.push({
      time: timeStr,
      available,
      reason
    })
  }
  
  return slots
}