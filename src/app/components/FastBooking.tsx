"use client";

import { useState } from "react";

declare global {
  interface Window {
    gtag: (command: string, targetId: string, parameters?: object) => void;
  }
}

interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: string;
  description: string;
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
  const [bookingData, setBookingData] = useState<BookingData>({
    service: null,
    date: "",
    time: "",
    clientName: "",
    clientPhone: "",
    address: "",
    neighborhood: ""
  });

  const services: Service[] = [
    {
      id: "semi-permanent",
      name: "✨ Semi Permanente Premium",
      duration: 75,
      price: "COP $50.000",
      description: "Técnica avanzada con acabado profesional de hasta 4 semanas. Ideal para manos impecables y brillantes por más tiempo."
    },
    {
      id: "acrylic-mold",
      name: "💅 Uñas Acrílicas con Molde",
      duration: 120,
      price: "COP $90.000",
      description: "Diseño estructural personalizado para mayor resistencia y elegancia."
    },
    {
      id: "acrylic-coating",
      name: "💖 Forrado en Acrílico",
      duration: 90,
      price: "COP $75.000",
      description: "Refuerzo ideal para uñas naturales, más fuertes y duraderas sin perder la naturalidad."
    },
    {
      id: "acrylic-tips",
      name: "🌟 Uñas Acrílicas con Tips",
      duration: 100,
      price: "COP $70.000",
      description: "Extensiones rápidas y perfectas para lucir uñas largas y estilizadas."
    }
  ];

  const neighborhoods = [
    "Ciudad Jardín", "Santa Teresita", "El Peñón", "San Fernando",
    "Santa Rita", "Pance", "La Hacienda", "Bochalema", "Otro (especificar)"
  ];

  const timeSlots = [
    "9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM", "6:00 PM"
  ];

  // Generate next 14 days, excluding past dates
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Mondays (day 1) as the professional might not work
      if (date.getDay() !== 1) {
        dates.push({
          date: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString('es-CO', { weekday: 'short' }),
          dayNumber: date.getDate(),
          month: date.toLocaleDateString('es-CO', { month: 'short' })
        });
      }
    }
    return dates;
  };

  const availableDates = generateAvailableDates();

  const handleServiceSelect = (service: Service) => {
    setBookingData({ ...bookingData, service });
    setStep(2);
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    setBookingData({ ...bookingData, date, time });
    setStep(3);
  };

  const handleClientInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4);
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [time, period] = startTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let totalMinutes = (period === 'PM' && hours !== 12 ? hours + 12 : hours) * 60 + minutes;
    totalMinutes += duration;
    
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    const endPeriod = endHours >= 12 ? 'PM' : 'AM';
    const displayHours = endHours > 12 ? endHours - 12 : endHours === 0 ? 12 : endHours;
    
    return `${displayHours}:${endMins.toString().padStart(2, '0')} ${endPeriod}`;
  };

  const generateWhatsAppMessage = () => {
    const { service, date, time, clientName, clientPhone, neighborhood, address } = bookingData;
    const endTime = service ? calculateEndTime(time, service.duration) : time;
    const formattedDate = new Date(date).toLocaleDateString('es-CO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const originalPrice = service?.id === "semi-permanent" ? "COP $60.000" :
                         service?.id === "acrylic-mold" ? "COP $100.000" :
                         service?.id === "acrylic-coating" ? "COP $85.000" : "COP $80.000";

    return encodeURIComponent(
      `🗓️ NUEVA CITA AGENDADA - FORMULARIO WEB\n\n` +
      `👩‍💼 Cliente: ${clientName}\n` +
      `📱 Teléfono: ${clientPhone}\n\n` +
      `💅 Servicio: ${service?.name}\n` +
      `💰 Precio original: ${originalPrice}\n` +
      `🎉 Descuento primera vez: -$10.000\n` +
      `💚 Precio final: ${service?.price}\n` +
      `⏰ Duración: ${service?.duration} minutos\n\n` +
      `📅 Fecha: ${formattedDate}\n` +
      `🕐 Hora: ${time} - ${endTime}\n\n` +
      `📍 Ubicación:\n` +
      `Barrio: ${neighborhood}\n` +
      `Dirección: ${address}\n\n` +
      `✅ Confirma disponibilidad por favor.\n` +
      `💳 Pago al finalizar: ${service?.price} (descuento ya aplicado)`
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
          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-center mb-8">1. Elige tu Servicio</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="bg-white border-2 border-gray-200 hover:border-yellow-400 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-elegant group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-xl font-semibold text-gray-800 group-hover:text-yellow-600">
                        {service.name}
                      </h4>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 line-through">
                          {service.id === "semi-permanent" ? "COP $60.000" :
                           service.id === "acrylic-mold" ? "COP $100.000" :
                           service.id === "acrylic-coating" ? "COP $85.000" : "COP $80.000"}
                        </div>
                        <div className="text-2xl font-bold text-green-600">{service.price}</div>
                        <div className="text-xs text-green-600 font-medium">¡Descuento aplicado!</div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">⏱️ {service.duration} min</span>
                      <span className="text-yellow-600 font-medium">Seleccionar →</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === 2 && bookingData.service && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold mb-2">2. Elige Fecha y Hora</h3>
                <p className="text-gray-600">
                  Servicio: <strong>{bookingData.service.name}</strong> • 
                  Duración: <strong>{bookingData.service.duration} min</strong>
                </p>
              </div>

              {/* Date Selection */}
              <div className="mb-8">
                <h4 className="text-lg font-medium mb-4">Selecciona la fecha:</h4>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
                  {availableDates.map((dateObj) => (
                    <button
                      key={dateObj.date}
                      onClick={() => setBookingData({ ...bookingData, date: dateObj.date })}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        bookingData.date === dateObj.date
                          ? 'border-yellow-400 bg-yellow-50'
                          : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase mb-1">{dateObj.dayName}</div>
                        <div className="text-lg font-semibold text-gray-800">{dateObj.dayNumber}</div>
                        <div className="text-xs text-gray-500">{dateObj.month}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {bookingData.date && (
                <div className="mb-8">
                  <h4 className="text-lg font-medium mb-4">Selecciona la hora:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {timeSlots.map((time) => {
                      const endTime = calculateEndTime(time, bookingData.service!.duration);
                      return (
                        <button
                          key={time}
                          onClick={() => handleDateTimeSelect(bookingData.date, time)}
                          className="p-4 border-2 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 rounded-xl transition-all duration-300"
                        >
                          <div className="text-center">
                            <div className="font-semibold text-gray-800">{time}</div>
                            <div className="text-xs text-gray-500">hasta {endTime}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  ← Cambiar Servicio
                </button>
              </div>
            </div>
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
                    onClick={() => setStep(2)}
                    className="btn-secondary"
                  >
                    ← Cambiar Fecha/Hora
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
                        <span className="font-medium text-yellow-600">{bookingData.service?.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duración:</span>
                        <span className="font-medium">{bookingData.service?.duration} minutos</span>
                      </div>
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
                          {bookingData.time} - {calculateEndTime(bookingData.time, bookingData.service?.duration || 0)}
                        </span>
                      </div>
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
                    <strong>No hay pago anticipado.</strong> Pagas {bookingData.service?.price} al finalizar el servicio 
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