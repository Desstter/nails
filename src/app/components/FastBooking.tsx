"use client";

import { useState } from "react";
import BookingCalendar from "./BookingCalendar";
import type { Service } from "@/types/booking";

declare global {
  interface Window {
    gtag: (command: string, targetId: string, parameters?: object) => void;
  }
}

interface BookingData {
  service: Service | null;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
  address: string;
  neighborhood: string;
}

export default function FastBooking() {
  const [step, setStep] = useState(1);
  const [useAdvancedMode, setUseAdvancedMode] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    service: null,
    date: "",
    time: "",
    clientName: "",
    clientPhone: "",
    address: "",
    neighborhood: ""
  });

  const neighborhoods = [
    "Ciudad Jardín", "Santa Teresita", "El Peñón", "San Fernando",
    "Santa Rita", "Pance", "La Hacienda", "Bochalema", "Otro (especificar)"
  ];

  const handleServiceSelect = (service: Service) => {
    setBookingData({ ...bookingData, service, date: "", time: "" });
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    setBookingData({ ...bookingData, date, time });
    if (date && time) {
      setStep(3);
    }
  };

  const handleClientInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4);
  };

  const calculateEndTime = (startTime: string, durationMin: number) => {
    // startTime viene en formato 24h "HH:MM"
    if (!startTime || !startTime.includes(':')) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMin;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    
    // Convertir a formato 12h
    const period = endHours >= 12 ? 'PM' : 'AM';
    const displayHours = endHours % 12 || 12;
    
    return `${displayHours}:${endMins.toString().padStart(2, '0')} ${period}`;
  };

  // Formatear tiempo de 24h a 12h
  const formatTime12h = (time24: string) => {
    if (!time24 || !time24.includes(':')) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Formatear precio con descuento
  const formatServicePrice = (service: Service) => {
    const discountedPrice = Math.max(0, service.basePriceCOP - 10000);
    return `$${discountedPrice.toLocaleString('es-CO')} COP`;
  };

  const generateWhatsAppMessage = () => {
    const { service, date, time, clientName, clientPhone, neighborhood, address } = bookingData;
    if (!service) return '';
    
    const hasDateTime = Boolean(date && time);
    const startTime12h = formatTime12h(time);
    const endTime = calculateEndTime(time, service.durationMin);
    const formattedDate = date
      ? new Date(date).toLocaleDateString('es-CO', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : '';

    const originalPrice = `$${service.basePriceCOP.toLocaleString('es-CO')} COP`;
    const finalPrice = formatServicePrice(service);

    const scheduleLine = hasDateTime
      ? `📅 Fecha: ${formattedDate}\n` +
        `🕐 Hora: ${startTime12h} - ${endTime}\n\n`
      : `📅 Fecha y hora: A coordinar por WhatsApp\n\n`;

    return encodeURIComponent(
      `🗓️ NUEVA CITA AGENDADA - FORMULARIO WEB\n\n` +
      `👩‍💼 Cliente: ${clientName}\n` +
      `📱 Teléfono: ${clientPhone}\n\n` +
      `💅 Servicio: ${service.name}\n` +
      `💰 Precio original: ${originalPrice}\n` +
      `🎉 Descuento primera vez: -$10.000\n` +
      `💚 Precio final: ${finalPrice}\n` +
      `⏰ Duración: ${service.durationMin} minutos\n\n` +
      scheduleLine +
      `📍 Ubicación:\n` +
      `Barrio: ${neighborhood}\n` +
      `Dirección: ${address}\n\n` +
      `✅ Confirma disponibilidad por favor.\n` +
      `💳 Pago al finalizar: ${finalPrice} (descuento ya aplicado)`
    );
  };

  const sendWhatsAppBooking = () => {
    // Track Google Ads conversion
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-17469563871/OcVkCKCtuYUbEN_HkYpB',
        'value': 1.0,
        'currency': 'COP'
      });
    }
    
    const message = generateWhatsAppMessage();
    window.open(`https://wa.me/573187229548?text=${message}`, "_blank");
  };

  return (
    <section id="reservar" className="section-padding bg-white">
      <div className="container-luxury">
        <div className="text-center mb-12">
          <h2 className="text-luxury-lg mb-4">
            Agenda tu Cita en <span className="gradient-gold">Menos de 1 Minuto</span>
          </h2>
          <p className="text-premium mb-6">
            Sistema rápido y fácil. No necesitas crear cuenta ni pagar por adelantado.
          </p>
          {/* Promoción de descuento */}
          {/* Selector de Modo */}
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Modo de reserva:</span>
                  <div className="text-xs text-gray-500 mt-1">
                    {useAdvancedMode ? 'Con verificación automática' : 'Rápido vía WhatsApp'}
                  </div>
                </div>
                <button
                  onClick={() => setUseAdvancedMode(!useAdvancedMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    useAdvancedMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useAdvancedMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 max-w-2xl mx-auto shadow-luxury">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-2xl">🎉</span>
              <h3 className="text-xl font-bold">¡Oferta Especial!</h3>
              <span className="text-2xl">🎉</span>
            </div>
            <p className="text-lg font-semibold mb-2">
              Si agendas tu cita por este formulario: <span className="text-yellow-300">-$10,000 de descuento</span> en tu primera vez
            </p>
            <p className="text-sm opacity-90">
              Válido solo para nuevas clientas que reserven a través de este sistema
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step > stepNumber ? 'bg-yellow-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Steps 1 & 2: Service Selection and Booking Calendar */}
          {(step === 1 || step === 2) && (
            <>
              {useAdvancedMode ? (
                <BookingCalendar
                  onServiceSelect={handleServiceSelect}
                  onDateTimeSelect={handleDateTimeSelect}
                  selectedService={bookingData.service}
                  selectedDate={bookingData.date}
                  selectedTime={bookingData.time}
                />
              ) : (
                <div className="space-y-8">
                  {/* Modo Simple: Solo selección de servicio */}
                  <div>
                    <h3 className="text-2xl font-semibold text-center mb-8">1. Elige tu Servicio</h3>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Servicios estáticos para modo simple */}
                      {[
                        { id: '1', name: 'Semi Permanente Premium', price: 60000, duration: 75 },
                        { id: '2', name: 'Uñas Acrílicas con Molde', price: 100000, duration: 120 },
                        { id: '3', name: 'Forrado en Acrílico', price: 85000, duration: 90 },
                        { id: '4', name: 'Uñas Acrílicas con Tips', price: 80000, duration: 100 },
                        { id: '5', name: 'Pedicure Premium', price: 45000, duration: 60 }
                      ].map((service) => {
                        const isSelected = bookingData.service?.name === service.name
                        const discountedPrice = Math.max(0, service.price - 10000)
                        
                        return (
                          <button
                            key={service.id}
                            onClick={() => {
                              handleServiceSelect({
                                id: service.id,
                                name: service.name,
                                durationMin: service.duration,
                                basePriceCOP: service.price,
                                active: true,
                                defaultBufferMin: 15
                              } as Service)
                              setStep(2)
                            }}
                            className={`relative border-2 rounded-2xl p-6 text-left transition-all duration-300 group transform hover:scale-[1.02] ${
                              isSelected
                                ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-luxury ring-2 ring-yellow-200'
                                : 'border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-50 hover:shadow-elegant'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-3 right-3">
                                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            )}
                            
                            <div className="mb-4">
                              <h4 className={`text-xl font-semibold transition-colors mb-2 ${
                                isSelected ? 'text-yellow-700' : 'text-gray-800 group-hover:text-yellow-600'
                              }`}>
                                {service.name}
                              </h4>
                              <div className="flex items-center gap-3 mb-3">
                                <div className="text-right">
                                  <div className="text-sm text-gray-500 line-through">
                                    ${service.price.toLocaleString('es-CO')} COP
                                  </div>
                                  <div className="text-2xl font-bold text-green-600">
                                    ${discountedPrice.toLocaleString('es-CO')} COP
                                  </div>
                                  <div className="text-xs text-green-600 font-medium">
                                    ¡Ahorro $10.000!
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-2 text-center">
                                    <span className="text-sm font-medium text-green-700">
                                      ⏱️ {service.duration} min
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className={`mt-4 pt-4 border-t transition-colors ${
                              isSelected ? 'border-yellow-200' : 'border-gray-100'
                            }`}>
                              <span className={`font-medium text-center block transition-colors ${
                                isSelected ? 'text-yellow-700' : 'text-yellow-600 group-hover:text-yellow-700'
                              }`}>
                                {isSelected ? '✓ Servicio Seleccionado' : 'Seleccionar Servicio →'}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Paso 2 en modo simple: Solo mensaje de que se contactarán */}
                  {step === 2 && bookingData.service && (
                    <div className="text-center">
                      <h3 className="text-2xl font-semibold mb-4">2. ¡Perfecto!</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 max-w-md mx-auto">
                        <p className="text-blue-700 mb-4">
                          Has seleccionado: <strong>{bookingData.service.name}</strong>
                        </p>
                        <p className="text-blue-600 text-sm mb-4">
                          Continúa para completar tus datos y te enviaremos la información vía WhatsApp.
                        </p>
                        <button
                          onClick={() => setStep(3)}
                          className="btn-primary w-full"
                        >
                          Continuar con mis datos →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Step 3: Client Information */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-center mb-8">3. Tus Datos</h3>
              
              <form onSubmit={handleClientInfo} className="space-y-6 max-w-2xl mx-auto">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingData.clientName}
                      onChange={(e) => setBookingData({ ...bookingData, clientName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp / Teléfono *
                    </label>
                    <input
                      type="tel"
                      required
                      value={bookingData.clientPhone}
                      onChange={(e) => setBookingData({ ...bookingData, clientPhone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="3XX XXX XXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barrio / Zona *
                  </label>
                  <select
                    required
                    value={bookingData.neighborhood}
                    onChange={(e) => setBookingData({ ...bookingData, neighborhood: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="">Selecciona tu barrio</option>
                    {neighborhoods.map((neighborhood) => (
                      <option key={neighborhood} value={neighborhood}>
                        {neighborhood}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección completa *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={bookingData.address}
                    onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Calle/Carrera X # XX-XX, Apto/Casa XXX, Referencias adicionales..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary"
                  >
                    ← Cambiar Servicio/Fecha
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Continuar →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold mb-2">4. Confirmar Cita</h3>
                <p className="text-gray-600">Revisa los detalles antes de enviar</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-pink-50 rounded-2xl p-8 border border-yellow-200">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Service Details */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Detalles del Servicio</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Servicio:</span>
                        <span className="font-medium">{bookingData.service?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Precio:</span>
                        <span className="font-medium text-yellow-600">
                          {bookingData.service ? formatServicePrice(bookingData.service) : ''}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duración:</span>
                        <span className="font-medium">{bookingData.service?.durationMin} minutos</span>
                      </div>
                      {bookingData.date && bookingData.time ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha:</span>
                            <span className="font-medium">
                              {new Date(bookingData.date).toLocaleDateString('es-CO', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hora:</span>
                            <span className="font-medium">
                              {formatTime12h(bookingData.time)} - {calculateEndTime(bookingData.time, bookingData.service?.durationMin || 0)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fecha y hora:</span>
                          <span className="font-medium text-yellow-600">A coordinar por WhatsApp</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Client Details */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Datos del Cliente</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600">Nombre:</span>
                        <div className="font-medium">{bookingData.clientName}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Teléfono:</span>
                        <div className="font-medium">{bookingData.clientPhone}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Barrio:</span>
                        <div className="font-medium">{bookingData.neighborhood}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Dirección:</span>
                        <div className="font-medium">{bookingData.address}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Reminder */}
                <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 text-lg">💳</span>
                    <span className="font-semibold text-green-700">Recordatorio de Pago</span>
                  </div>
                  <p className="text-green-600 text-sm">
                    <strong>No hay pago anticipado.</strong> Pagas {bookingData.service ? formatServicePrice(bookingData.service) : ''} al finalizar el servicio 
                    (ya incluye descuento de $10.000 por primera vez). 
                    Acepto efectivo, Nequi, Bancolombia o transferencia.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setStep(3)}
                    className="btn-secondary"
                  >
                    ← Editar Datos
                  </button>
                  <button
                    onClick={sendWhatsAppBooking}
                    className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.886 3.488"/>
                    </svg>
                    Enviar Cita por WhatsApp
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}