// Hook para manejo de APIs del sistema de reservas
import { useState, useEffect } from 'react'
import type { 
  Service, 
  AvailabilityResponse, 
  ServicesResponse, 
  APIResponse 
} from '@/types/booking'

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/services')
        const data: APIResponse<ServicesResponse> = await response.json()

        if (data.success && data.data) {
          setServices(data.data.services)
        } else {
          setError(data.error?.message || 'Error al cargar servicios')
        }
      } catch (err) {
        setError('Error de conexión al cargar servicios')
        console.error('Error fetching services:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  return { services, loading, error }
}

export function useAvailability(serviceId: string | null, date: string | null) {
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!serviceId || !date) {
      setAvailability(null)
      setLoading(false)
      setError(null)
      return
    }

    async function fetchAvailability() {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          serviceId,
          date
        })

        const response = await fetch(`/api/availability?${params}`)
        const data: APIResponse<AvailabilityResponse> = await response.json()

        if (data.success && data.data) {
          setAvailability(data.data)
        } else {
          setError(data.error?.message || 'Error al consultar disponibilidad')
          setAvailability(null)
        }
      } catch (err) {
        setError('Error de conexión al consultar disponibilidad')
        setAvailability(null)
        console.error('Error fetching availability:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [serviceId, date])

  return { availability, loading, error }
}

// Hook para generar fechas disponibles (próximos 14 días)
export function useAvailableDates() {
  const generateDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // No excluir ningún día por ahora, dejamos que la API maneje los horarios laborales
      dates.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('es-CO', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('es-CO', { month: 'short' }),
        weekday: date.getDay()
      })
    }
    return dates
  }

  return generateDates()
}