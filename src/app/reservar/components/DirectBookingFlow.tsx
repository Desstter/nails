"use client";

import { useState } from "react";
import { useServices, useAvailability, useAvailableDates } from "@/hooks/useBookingAPI";
import type { Service, BookingFormData } from "@/types/booking";

interface DirectBookingFlowProps {
  utmData: {
    source: string;
    medium: string;
    campaign: string;
    content: string;
    term: string;
  };
}

type BookingStep = "service" | "datetime" | "details" | "confirmation" | "success";

export default function DirectBookingFlow({ utmData }: DirectBookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>("service");
  const [bookingData, setBookingData] = useState<BookingFormData>({
    service: null,
    date: "",
    time: "",
    clientName: "",
    clientPhone: "",
    address: "",
    neighborhood: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationResult, setReservationResult] = useState<{
    success: boolean;
    appointmentId?: string;
    token?: string;
    error?: string;
  } | null>(null);

  const { services, loading: servicesLoading, error: servicesError } = useServices();
  const { availability, loading: availabilityLoading, error: availabilityError } = useAvailability(
    bookingData.service?.id || null,
    bookingData.date || null
  );
  const availableDates = useAvailableDates();

  const neighborhoods = [
    "Ciudad Jardín", "Santa Teresita", "El Peñón", "San Fernando",
    "Santa Rita", "Pance", "La Hacienda", "Bochalema", "Otro (especificar)"
  ];

  // Formatear precio con descuento
  const formatPriceWithDiscount = (service: Service) => {
    const discountedPrice = Math.max(0, service.basePriceCOP - 10000);
    return {
      original: service.basePriceCOP.toLocaleString("es-CO"),
      final: discountedPrice.toLocaleString("es-CO"),
    };
  };

  // Formatear tiempo a 12h
  const formatTime12h = (time24: string) => {
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Calcular hora de fin
  const calculateEndTime = (startTime: string, durationMin: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMin;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    const endTime24 = `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
    return formatTime12h(endTime24);
  };

  // Handlers
  const handleServiceSelect = (service: Service) => {
    setBookingData({ ...bookingData, service, date: "", time: "" });
    setCurrentStep("datetime");
    
    // Track service selection
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "select_content", {
        content_type: "service",
        content_id: service.id,
        value: service.basePriceCOP,
        currency: "COP",
      });
    }
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    setBookingData({ ...bookingData, date, time });
    if (date && time) {
      setCurrentStep("details");
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("confirmation");
  };

  const submitReservation = async () => {
    if (!bookingData.service) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: bookingData.service.id,
          startAt: `${bookingData.date}T${bookingData.time}:00`,
          clientName: bookingData.clientName,
          phoneWhatsApp: bookingData.clientPhone,
          address: bookingData.address,
          neighborhood: bookingData.neighborhood,
          notes: bookingData.notes,
          ...utmData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setReservationResult({
          success: true,
          appointmentId: result.data.appointmentId,
          token: result.data.token,
        });
        setCurrentStep("success");

        // Track successful booking
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "purchase", {
            transaction_id: result.data.appointmentId,
            value: bookingData.service.basePriceCOP - 10000,
            currency: "COP",
            items: [
              {
                item_id: bookingData.service.id,
                item_name: bookingData.service.name,
                category: "beauty_service",
                quantity: 1,
                price: bookingData.service.basePriceCOP - 10000,
              },
            ],
          });
        }
      } else {
        setReservationResult({
          success: false,
          error: result.error?.message || "Error al procesar la reserva",
        });
      }
    } catch (error) {
      setReservationResult({
        success: false,
        error: "Error de conexión. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWhatsAppMessage = () => {
    if (!bookingData.service) return "";

    const startTime12h = formatTime12h(bookingData.time);
    const endTime = calculateEndTime(bookingData.time, bookingData.service.durationMin);
    const formattedDate = new Date(bookingData.date).toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const pricing = formatPriceWithDiscount(bookingData.service);

    return encodeURIComponent(
      `🗓️ NUEVA CITA RESERVADA ONLINE\n\n` +
      `👩‍💼 Cliente: ${bookingData.clientName}\n` +
      `📱 Teléfono: ${bookingData.clientPhone}\n\n` +
      `💅 Servicio: ${bookingData.service.name}\n` +
      `💰 Precio original: $${pricing.original} COP\n` +
      `🎉 Descuento online: -$10.000\n` +
      `💚 Precio final: $${pricing.final} COP\n` +
      `⏰ Duración: ${bookingData.service.durationMin} minutos\n\n` +
      `📅 Fecha: ${formattedDate}\n` +
      `🕐 Hora: ${startTime12h} - ${endTime}\n\n` +
      `📍 Ubicación:\n` +
      `Barrio: ${bookingData.neighborhood}\n` +
      `Dirección: ${bookingData.address}\n\n` +
      `${bookingData.notes ? `📝 Notas: ${bookingData.notes}\n\n` : ""}` +
      `✅ Cita confirmada automáticamente\n` +
      `💳 Pago al finalizar: $${pricing.final} COP`
    );
  };

  if (servicesError) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
          <div className="text-red-600 text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar servicios</h3>
          <p className="text-red-600 mb-4">{servicesError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[
            { key: "service", label: "Servicio", icon: "💅" },
            { key: "datetime", label: "Fecha/Hora", icon: "📅" },
            { key: "details", label: "Datos", icon: "👤" },
            { key: "confirmation", label: "Confirmar", icon: "✅" },
          ].map((step, index) => {
            const isActive = 
              (step.key === "service" && ["service", "datetime", "details", "confirmation", "success"].includes(currentStep)) ||
              (step.key === "datetime" && ["datetime", "details", "confirmation", "success"].includes(currentStep)) ||
              (step.key === "details" && ["details", "confirmation", "success"].includes(currentStep)) ||
              (step.key === "confirmation" && ["confirmation", "success"].includes(currentStep));
            
            const isCurrent = step.key === currentStep;

            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center space-x-2 ${isCurrent ? "scale-110" : ""} transition-transform`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isActive ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-600"
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`hidden md:block text-sm font-medium ${
                    isActive ? "text-yellow-600" : "text-gray-500"
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`w-8 h-1 mx-2 transition-colors ${
                    ["datetime", "details", "confirmation", "success"].includes(currentStep) && index < 
                    (currentStep === "datetime" ? 1 : currentStep === "details" ? 2 : currentStep === "confirmation" ? 3 : 4)
                      ? "bg-yellow-500" : "bg-gray-200"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Paso 1: Selección de Servicio */}
      {currentStep === "service" && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Elige tu Servicio</h2>
            <p className="text-gray-600">Selecciona el servicio que deseas reservar</p>
          </div>

          {servicesLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-2xl p-6 h-48" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service) => {
                const pricing = formatPriceWithDiscount(service);
                
                return (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="bg-white border-2 border-gray-200 hover:border-yellow-400 hover:shadow-lg rounded-2xl p-6 text-left transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-yellow-600">
                        {service.name}
                      </h3>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 line-through">
                          ${pricing.original} COP
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          ${pricing.final} COP
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          ¡Descuento online!
                        </div>
                      </div>
                    </div>
                    
                    {service.description && (
                      <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        ⏱️ {service.durationMin} minutos
                      </span>
                      <span className="text-yellow-600 font-medium group-hover:text-yellow-700">
                        Seleccionar →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Paso 2: Fecha y Hora */}
      {currentStep === "datetime" && bookingData.service && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Elige Fecha y Hora</h2>
            <p className="text-gray-600">
              Servicio: <strong>{bookingData.service.name}</strong> • 
              Duración: <strong>{bookingData.service.durationMin} min</strong>
            </p>
          </div>

          {/* Selección de Fecha */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Selecciona la fecha:</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
              {availableDates.map((dateObj) => {
                const isSelected = bookingData.date === dateObj.date;
                
                return (
                  <button
                    key={dateObj.date}
                    onClick={() => setBookingData({ ...bookingData, date: dateObj.date, time: "" })}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      isSelected
                        ? "border-yellow-400 bg-yellow-50 shadow-md"
                        : "border-gray-200 hover:border-yellow-300 hover:bg-yellow-50"
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
                );
              })}
            </div>
          </div>

          {/* Selección de Hora */}
          {bookingData.date && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Selecciona la hora:</h3>
              
              {availabilityLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-gray-100 animate-pulse rounded-xl p-4 h-16" />
                  ))}
                </div>
              ) : availabilityError ? (
                <div className="text-center py-8">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="text-red-600 text-2xl mb-2">❌</div>
                    <p className="text-red-600">{availabilityError}</p>
                  </div>
                </div>
              ) : !availability?.slots.length ? (
                <div className="text-center py-8">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <div className="text-gray-400 text-4xl mb-4">😔</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay horarios disponibles</h3>
                    <p className="text-gray-600">Intenta con otra fecha</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availability.slots.map((slot) => {
                    const isSelected = bookingData.time === slot.time;
                    const time12h = formatTime12h(slot.time);
                    const endTime = calculateEndTime(slot.time, bookingData.service!.durationMin);
                    
                    return (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && handleDateTimeSelect(bookingData.date, slot.time)}
                        disabled={!slot.available}
                        className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                          !slot.available
                            ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
                            : isSelected
                            ? "border-yellow-400 bg-yellow-50 shadow-md"
                            : "border-gray-200 hover:border-yellow-400 hover:bg-yellow-50"
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
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Botón volver */}
          <div className="flex justify-center">
            <button
              onClick={() => setCurrentStep("service")}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Cambiar Servicio
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Datos del Cliente */}
      {currentStep === "details" && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Tus Datos</h2>
            <p className="text-gray-600">Completa la información para confirmar tu cita</p>
          </div>

          <form onSubmit={handleDetailsSubmit} className="space-y-6 max-w-2xl mx-auto">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas adicionales (opcional)
              </label>
              <textarea
                rows={2}
                value={bookingData.notes}
                onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Alguna solicitud especial, color preferido, etc."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep("datetime")}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← Cambiar Fecha/Hora
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 font-semibold"
              >
                Continuar →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Paso 4: Confirmación */}
      {currentStep === "confirmation" && bookingData.service && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Confirma tu Cita</h2>
            <p className="text-gray-600">Revisa los detalles antes de confirmar</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-pink-50 rounded-2xl p-8 border border-yellow-200 max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Detalles del Servicio */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalles del Servicio</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Servicio:</span>
                    <span className="font-medium">{bookingData.service.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio:</span>
                    <span className="font-medium text-green-600">
                      ${formatPriceWithDiscount(bookingData.service).final} COP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duración:</span>
                    <span className="font-medium">{bookingData.service.durationMin} minutos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-medium">
                      {new Date(bookingData.date).toLocaleDateString("es-CO", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora:</span>
                    <span className="font-medium">
                      {formatTime12h(bookingData.time)} - {calculateEndTime(bookingData.time, bookingData.service.durationMin)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Datos del Cliente */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos del Cliente</h3>
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
                  {bookingData.notes && (
                    <div>
                      <span className="text-gray-600">Notas:</span>
                      <div className="font-medium">{bookingData.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recordatorio de Pago */}
            <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600 text-lg">💳</span>
                <span className="font-semibold text-green-700">Recordatorio de Pago</span>
              </div>
              <p className="text-green-600 text-sm">
                <strong>No hay pago anticipado.</strong> Pagas ${formatPriceWithDiscount(bookingData.service).final} COP al finalizar el servicio 
                (descuento de $10.000 ya aplicado). Acepto efectivo, Nequi, Bancolombia o transferencia.
              </p>
            </div>

            {/* Error de reserva */}
            {reservationResult && !reservationResult.success && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-600 text-lg">❌</span>
                  <span className="font-semibold text-red-700">Error en la Reserva</span>
                </div>
                <p className="text-red-600 text-sm">{reservationResult.error}</p>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setCurrentStep("details")}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                ← Editar Datos
              </button>
              <button
                onClick={submitReservation}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <span className="text-lg">✅</span>
                    Confirmar Reserva
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paso 5: Éxito */}
      {currentStep === "success" && reservationResult?.success && bookingData.service && (
        <div className="space-y-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Cita Confirmada!</h2>
            <p className="text-gray-600">Tu reserva ha sido procesada exitosamente</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200 max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {bookingData.service.name}
              </h3>
              <p className="text-gray-600">
                {new Date(bookingData.date).toLocaleDateString("es-CO", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })} • {formatTime12h(bookingData.time)}
              </p>
            </div>

            <div className="space-y-4">
              <a
                href={`https://wa.me/573187229548?text=${generateWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
              >
                📱 Enviar Detalles por WhatsApp
              </a>

              {reservationResult.token && (
                <a
                  href={`/reservar/${reservationResult.token}`}
                  className="block w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  🔗 Ver/Gestionar mi Cita
                </a>
              )}

              <div className="text-sm text-gray-600 bg-white rounded-lg p-4">
                <p className="mb-2">
                  <strong>Recordatorio:</strong> Recibirás confirmación por WhatsApp.
                </p>
                <p>
                  Pago al finalizar: ${formatPriceWithDiscount(bookingData.service).final} COP
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}