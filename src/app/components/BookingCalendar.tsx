"use client";

import { useState } from 'react'
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
            <h4 className="text-lg font-medium mb-4">Selecciona la fecha:</h4>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
              {availableDates.map((dateObj) => {
                const isSelected = selectedDate === dateObj.date
                
                return (
                  <button
                    key={dateObj.date}
                    onClick={() => onDateTimeSelect(dateObj.date, '')}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase mb-1">
                        {dateObj.dayName}
                      </div>
                      <div className="text-lg font-semibold text-gray-800">
                        {dateObj.dayNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {dateObj.month}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selección de Hora */}
          {selectedDate && (
            <div className="mb-8">
              <h4 className="text-lg font-medium mb-4">Selecciona la hora:</h4>
              
              {availabilityLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-gray-100 animate-pulse rounded-xl p-4 h-16" />
                  ))}
                </div>
              ) : availabilityError ? (
                <div className="text-center py-8 text-red-600">
                  ❌ {availabilityError}
                </div>
              ) : !availability?.slots.length ? (
                <div className="text-center py-8 text-gray-600">
                  😔 No hay horarios disponibles para esta fecha
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {availability.slots.map((slot) => {
                    const isSelected = selectedTime === slot.time
                    const time12h = formatTime12h(slot.time)
                    const endTime = calculateEndTime(slot.time, selectedService.durationMin)
                    
                    return (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && onDateTimeSelect(selectedDate, slot.time)}
                        disabled={!slot.available}
                        className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                          !slot.available
                            ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                            : isSelected
                            ? 'border-yellow-400 bg-yellow-50'
                            : 'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                        }`}
                        title={slot.reason}
                      >
                        <div className="text-center">
                          <div className="font-semibold text-gray-800">
                            {time12h}
                          </div>
                          <div className="text-xs text-gray-500">
                            hasta {endTime}
                          </div>
                          {!slot.available && slot.reason && (
                            <div className="text-xs text-red-500 mt-1">
                              No disponible
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}