"use client";

import { useState, useMemo } from 'react'
import { useServices, useAvailability, useAvailableDates } from '@/hooks/useBookingAPI'
import type { Service, TimeSlot } from '@/types/booking'

interface BookingCalendarProps {
  onServiceSelect: (service: Service) => void
  onDateTimeSelect: (date: string, time: string) => void
  selectedService: Service | null
  selectedDate: string
  selectedTime: string
}

export default function BookingCalendar({
  onServiceSelect,
  onDateTimeSelect,
  selectedService,
  selectedDate,
  selectedTime
}: BookingCalendarProps) {
  const { services, loading: servicesLoading, error: servicesError } = useServices()
  const { availability, loading: availabilityLoading, error: availabilityError } = useAvailability(
    selectedService?.id || null,
    selectedDate || null
  )
  const availableDates = useAvailableDates()

  // Formatear precio con descuento
  const formatPriceWithDiscount = (service: Service) => {
    const discountedPrice = Math.max(0, service.basePriceCOP - 10000)
    return {
      original: service.basePriceCOP.toLocaleString('es-CO'),
      final: discountedPrice.toLocaleString('es-CO')
    }
  }

  // Formatear tiempo a formato 12h
  const formatTime12h = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  // Calcular hora de fin
  const calculateEndTime = (startTime: string, durationMin: number) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + durationMin
    const endHours = Math.floor(totalMinutes / 60)
    const endMins = totalMinutes % 60
    const endTime24 = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
    return formatTime12h(endTime24)
  }

  if (servicesError) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          ❌ {servicesError}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-secondary"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Paso 1: Selección de Servicio */}
      <div>
        <h3 className="text-2xl font-semibold text-center mb-8">1. Elige tu Servicio</h3>
        
        {servicesLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-2xl p-6 h-48" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const pricing = formatPriceWithDiscount(service)
              const isSelected = selectedService?.id === service.id
              
              return (
                <button
                  key={service.id}
                  onClick={() => onServiceSelect(service)}
                  className={`border-2 rounded-2xl p-6 text-left transition-all duration-300 group ${
                    isSelected
                      ? 'border-yellow-400 bg-yellow-50 shadow-elegant'
                      : 'border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-50 hover:shadow-elegant'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className={`text-xl font-semibold transition-colors ${
                      isSelected ? 'text-yellow-700' : 'text-gray-800 group-hover:text-yellow-600'
                    }`}>
                      {service.name}
                    </h4>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 line-through">
                        ${pricing.original} COP
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        ${pricing.final} COP
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        ¡Descuento aplicado!
                      </div>
                    </div>
                  </div>
                  
                  {service.description && (
                    <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      ⏱️ {service.durationMin} min
                    </span>
                    <span className={`font-medium transition-colors ${
                      isSelected ? 'text-yellow-700' : 'text-yellow-600'
                    }`}>
                      {isSelected ? '✓ Seleccionado' : 'Seleccionar →'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Paso 2: Selección de Fecha */}
      {selectedService && (
        <div>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold mb-2">2. Elige Fecha y Hora</h3>
            <p className="text-gray-600">
              Servicio: <strong>{selectedService.name}</strong> • 
              Duración: <strong>{selectedService.durationMin} min</strong>
            </p>
          </div>

          {/* Selección de Fecha */}
          <div className="mb-8">
            <h4 className="text-lg font-medium mb-6 text-center">📅 Selecciona la fecha perfecta para ti:</h4>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
                {availableDates.map((dateObj) => {
                  const isSelected = selectedDate === dateObj.date
                  const isToday = dateObj.date === new Date().toISOString().split('T')[0]
                  const isWeekend = dateObj.weekday === 0 || dateObj.weekday === 6
                  
                  return (
                    <button
                      key={dateObj.date}
                      onClick={() => onDateTimeSelect(dateObj.date, '')}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        isSelected
                          ? 'border-yellow-400 bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-lg ring-2 ring-yellow-300'
                          : 'border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-50 hover:shadow-md'
                      } ${
                        isWeekend ? 'opacity-75' : ''
                      }`}
                      disabled={!isSelected && selectedDate && selectedDate !== dateObj.date}
                    >
                      {isToday && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="text-center">
                        <div className={`text-xs uppercase mb-1 font-medium ${
                          isWeekend ? 'text-orange-600' : 'text-gray-500'
                        }`}>
                          {dateObj.dayName}
                        </div>
                        <div className={`text-lg font-bold ${
                          isSelected ? 'text-yellow-700' : isToday ? 'text-red-600' : 'text-gray-800'
                        }`}>
                          {dateObj.dayNumber}
                        </div>
                        <div className={`text-xs font-medium ${
                          isSelected ? 'text-yellow-600' : 'text-gray-500'
                        }`}>
                          {dateObj.month}
                        </div>
                      </div>
                      {isWeekend && (
                        <div className="absolute bottom-1 right-1 text-xs text-orange-500">
                          {dateObj.weekday === 0 ? '🌅' : '😴'}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Hoy
                  </span>
                  <span className="mx-4">•</span>
                  <span className="text-orange-600">🌅 Domingo disponible solo mañanas</span>
                  <span className="mx-4">•</span>
                  <span className="text-gray-500">😴 Sábados cerrado</span>
                </p>
              </div>
            </div>
          </div>

          {/* Selección de Hora */}
          {selectedDate && (
            <div className="mb-8">
              <h4 className="text-lg font-medium mb-6 text-center">🕐 Elige el horario que mejor te funcione:</h4>
              
              {availabilityLoading ? (
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-gray-100 animate-pulse rounded-xl p-4 h-20" />
                    ))}
                  </div>
                  <div className="text-center mt-4 text-gray-500">
                    ⏳ Consultando disponibilidad...
                  </div>
                </div>
              ) : availabilityError ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                  <div className="text-red-600 text-lg mb-2">❌ {availabilityError}</div>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="text-red-600 underline hover:text-red-700"
                  >
                    Intentar nuevamente
                  </button>
                </div>
              ) : !availability?.slots.length ? (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                  <div className="text-gray-600 text-lg mb-2">😔 No hay horarios disponibles</div>
                  <p className="text-gray-500 text-sm">
                    Esta fecha no tiene horarios laborales o están todos ocupados.
                    <br />Prueba seleccionando otra fecha.
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <div className="mb-4 text-center">
                    <p className="text-sm text-blue-700 font-medium">
                      Horarios disponibles para el {new Date(selectedDate).toLocaleDateString('es-CO', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </p>
                    {availability.businessHours && (
                      <p className="text-xs text-blue-600 mt-1">
                        Horario laboral: {formatTime12h(availability.businessHours.startTime)} - {formatTime12h(availability.businessHours.endTime)}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {availability.slots.map((slot) => {
                      const isSelected = selectedTime === slot.time
                      const time12h = formatTime12h(slot.time)
                      const endTime = calculateEndTime(slot.time, selectedService.durationMin)
                      
                      return (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && onDateTimeSelect(selectedDate, slot.time)}
                          disabled={!slot.available}
                          className={`relative p-4 border-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                            !slot.available
                              ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'border-blue-400 bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg ring-2 ring-blue-300'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                          }`}
                          title={slot.reason}
                        >
                          {isSelected && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          
                          <div className="text-center">
                            <div className={`text-lg font-bold mb-1 ${
                              isSelected ? 'text-blue-700' : !slot.available ? 'text-gray-500' : 'text-gray-800'
                            }`}>
                              {time12h}
                            </div>
                            <div className={`text-xs font-medium ${
                              isSelected ? 'text-blue-600' : !slot.available ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              hasta {endTime}
                            </div>
                            {!slot.available && (
                              <div className="text-xs text-red-500 mt-1 font-medium">
                                No disponible
                              </div>
                            )}
                            {slot.available && !isSelected && (
                              <div className="text-xs text-green-600 mt-1 font-medium">
                                ✓ Disponible
                              </div>
                            )}
                          </div>
                          
                          {!slot.available && (
                            <div className="absolute inset-0 bg-gray-200 bg-opacity-50 rounded-xl flex items-center justify-center">
                              <span className="text-gray-400 text-xs">❌</span>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-xs text-blue-600">
                      ⏰ Duración del servicio: <strong>{selectedService.durationMin} minutos</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}