// Tipos para el sistema de reservas Joangel Nails
// Compatible con Prisma schema

export interface Service {
  id: string
  name: string
  description?: string
  durationMin: number
  basePriceCOP: number
  active: boolean
  defaultBufferMin: number
}

export interface BusinessHour {
  id: string
  weekday: number // 0=Domingo, 1=Lunes, ..., 6=Sábado
  startTime: string // "HH:MM"
  endTime: string // "HH:MM"
  active: boolean
}

export interface TimeSlot {
  time: string // "HH:MM"
  available: boolean
  reason?: string // Si no disponible, razón
}

export interface AvailabilityRequest {
  serviceId: string
  date: string // YYYY-MM-DD
}

export interface AvailabilityResponse {
  date: string
  serviceId: string
  slots: TimeSlot[]
  businessHours?: {
    startTime: string
    endTime: string
  }
}

export interface ServicesResponse {
  services: Service[]
}

// Cliente booking data (mantenemos compatibilidad con FastBooking actual)
export interface BookingFormData {
  service: Service | null
  date: string
  time: string
  clientName: string
  clientPhone: string
  address: string
  neighborhood: string
  notes?: string
}

// Para futuras fases
export interface CreateAppointmentRequest {
  serviceId: string
  startAt: string // ISO datetime
  clientName: string
  phoneWhatsApp: string
  address: string
  neighborhood: string
  notes?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
}

export interface Appointment {
  id: string
  serviceId: string
  clientName: string
  phoneWhatsApp: string
  address: string
  neighborhood: string
  startAt: string // ISO datetime
  endAt: string // ISO datetime
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  priceCOP: number
  notes?: string
  bookingPublicToken: string
  service: Service
  createdAt: string
  updatedAt: string
}

// Error handling
export interface APIError {
  error: string
  message: string
  code?: string
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: APIError
}