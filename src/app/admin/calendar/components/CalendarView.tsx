'use client'

import { useState, useEffect } from 'react'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface Appointment {
  id: string
  clientName: string
  phoneWhatsApp: string
  address: string
  neighborhood: string
  startAt: string
  endAt: string
  status: string
  priceCOP: number
  notes: string | null
  googleEventId: string | null
  service: {
    id: string
    name: string
    durationMin: number
  }
}

interface CalendarViewProps {
  onDateSelect?: (date: Date) => void
  className?: string
}

export default function CalendarView({ onDateSelect, className = '' }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'month' | 'week'>('month')

  useEffect(() => {
    fetchAppointments()
  }, [currentDate])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      
      // Calcular rango de fechas para el mes actual
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const response = await fetch(
        `/api/admin/appointments?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}&limit=100`
      )
      
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.data.appointments || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Días del mes anterior para completar la primera semana
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, new Date(year, month, 0).getDate() - i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true })
    }

    // Días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length // 6 semanas × 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      days.push({ date: nextDate, isCurrentMonth: false })
    }

    return days
  }

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startAt).toISOString().split('T')[0]
      return aptDate === dateStr
    })
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date)
    }
  }

  const days = getDaysInMonth()

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-playfair font-bold text-gray-900 flex items-center gap-2">
            <CalendarDaysIcon className="h-6 w-6 text-gray-600" />
            Vista de Calendario
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 text-sm rounded-md ${
                view === 'month' 
                  ? 'bg-luxury-gold text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 text-sm rounded-md ${
                view === 'week' 
                  ? 'bg-luxury-gold text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semana
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Hoy
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <span className="text-lg font-medium text-gray-900 min-w-[180px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Indicadores de estado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Sincronizado con Google</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">No sincronizado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-gray-600">Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Hoy</span>
          </div>
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
            <span className="text-gray-600">
              {appointments.filter(apt => apt.googleEventId).length}/{appointments.length} sync
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4 text-blue-600" />
            <span className="text-gray-600">
              {getAppointmentsForDate(new Date()).length} hoy
            </span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Cargando citas...</p>
        </div>
      )}

      {!loading && view === 'month' && (
        <div className="grid grid-cols-7 gap-1">
          {/* Headers de días */}
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 bg-gray-50">
              {day}
            </div>
          ))}
          
          {/* Días del calendario */}
          {days.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day.date)
            const isCurrentDay = isToday(day.date)
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(day.date)}
                className={`min-h-[100px] p-2 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                } ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentDay ? 'text-blue-600' : 
                  day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {day.date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map(appointment => {
                    const isToday = new Date(appointment.startAt).toDateString() === new Date().toDateString()
                    const isPast = new Date(appointment.startAt) < new Date()
                    const syncStatus = appointment.googleEventId ? 'synced' : 'not-synced'
                    
                    return (
                      <div
                        key={appointment.id}
                        className={`text-xs p-1 rounded truncate relative overflow-hidden ${
                          syncStatus === 'synced'
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        } ${isToday ? 'ring-1 ring-blue-400' : ''} ${isPast ? 'opacity-75' : ''}`}
                        title={`${appointment.service.name} - ${appointment.clientName} (${new Date(appointment.startAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}) - ${syncStatus === 'synced' ? 'Sincronizado' : 'No sincronizado'}`}
                      >
                        <div className="flex items-center gap-1 relative z-10">
                          <div className={`w-2 h-2 rounded-full ${
                            syncStatus === 'synced' ? 'bg-green-600' : 'bg-red-600'
                          }`}></div>
                          <span className="truncate font-medium">
                            {new Date(appointment.startAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="truncate">
                            {appointment.clientName}
                          </span>
                        </div>
                        
                        {/* Indicador de estado adicional */}
                        <div className={`absolute top-0 right-0 w-1 h-full ${
                          syncStatus === 'synced' ? 'bg-green-600' : 'bg-red-600'
                        }`}></div>
                        
                        {isToday && (
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    )
                  })}
                  
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayAppointments.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && view === 'week' && (
        <div className="text-center py-12 text-gray-500">
          <CalendarDaysIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>Vista semanal próximamente</p>
          <p className="text-sm">Por ahora, usa la vista mensual</p>
        </div>
      )}

      {/* Resumen de citas del mes */}
      {!loading && appointments.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
                  <div className="text-sm text-blue-800">Total citas</div>
                </div>
                <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-200 rounded-full -mr-4 -mb-4 opacity-30"></div>
            </div>
            
            <div className="relative p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {appointments.filter(apt => apt.googleEventId).length}
                  </div>
                  <div className="text-sm text-green-800">Sincronizadas</div>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-200 rounded-full -mr-4 -mb-4 opacity-30"></div>
            </div>
            
            <div className="relative p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {appointments.filter(apt => !apt.googleEventId).length}
                  </div>
                  <div className="text-sm text-red-800">Sin sincronizar</div>
                </div>
                <XCircleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-red-200 rounded-full -mr-4 -mb-4 opacity-30"></div>
            </div>
            
            <div className="relative p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-amber-600">
                    {appointments.length > 0 ? 
                      Math.round((appointments.filter(apt => apt.googleEventId).length / appointments.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-amber-800">Tasa sync</div>
                </div>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-600 flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full ${
                      (appointments.filter(apt => apt.googleEventId).length / appointments.length) > 0.8 
                        ? 'bg-green-600' 
                        : (appointments.filter(apt => apt.googleEventId).length / appointments.length) > 0.5
                        ? 'bg-amber-600'
                        : 'bg-red-600'
                    }`}></div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-amber-200 rounded-full -mr-4 -mb-4 opacity-30"></div>
            </div>
          </div>
          
          {/* Barra de progreso visual */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progreso de sincronización</span>
              <span>{Math.round((appointments.filter(apt => apt.googleEventId).length / appointments.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${appointments.length > 0 ? (appointments.filter(apt => apt.googleEventId).length / appointments.length) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}