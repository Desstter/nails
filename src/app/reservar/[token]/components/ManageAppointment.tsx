"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Appointment } from "@/types/booking";

interface ManageAppointmentProps {
  token: string;
}

export default function ManageAppointment({ token }: ManageAppointmentProps) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchAppointment();
  }, [token]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/booking/${token}`);
      const data = await response.json();

      if (data.success) {
        setAppointment(data.data.appointment);
      } else {
        setError(data.error?.message || "Error al cargar la cita");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async () => {
    if (!appointment || !confirm("¿Estás segura de que quieres cancelar tu cita?")) {
      return;
    }

    try {
      setIsUpdating(true);

      const response = await fetch(`/api/booking/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      const data = await response.json();

      if (data.success) {
        setAppointment(data.data.appointment);
        alert("Cita cancelada exitosamente");
      } else {
        alert(data.error?.message || "Error al cancelar la cita");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString("es-CO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const generateWhatsAppMessage = (appointment: Appointment) => {
    const { date, time } = formatDateTime(appointment.startAt);
    const endTime = formatDateTime(appointment.endAt).time;

    return encodeURIComponent(
      `🗓️ CONSULTA SOBRE MI CITA\n\n` +
      `👩‍💼 Cliente: ${appointment.clientName}\n` +
      `📱 Teléfono: ${appointment.phoneWhatsApp}\n\n` +
      `💅 Servicio: ${appointment.service.name}\n` +
      `📅 Fecha: ${date}\n` +
      `🕐 Hora: ${time} - ${endTime}\n\n` +
      `📍 Dirección: ${appointment.address}\n` +
      `🏘️ Barrio: ${appointment.neighborhood}\n\n` +
      `Token de cita: ${appointment.bookingPublicToken}\n\n` +
      `Tengo una consulta sobre mi cita.`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando detalles de tu cita...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Cita no encontrada</h1>
          <p className="text-gray-600 mb-6">
            {error || "No pudimos encontrar una cita con este enlace."}
          </p>
          <Link
            href="/reservar"
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors inline-block"
          >
            Hacer nueva reserva
          </Link>
        </div>
      </div>
    );
  }

  const { date, time } = formatDateTime(appointment.startAt);
  const endTime = formatDateTime(appointment.endAt).time;
  const isPast = new Date(appointment.startAt) < new Date();
  const isCancelled = appointment.status === "cancelled";
  const isCompleted = appointment.status === "completed";

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/reservar" className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">J</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Joangel Nails Studio</h1>
                <p className="text-sm text-gray-600">Gestionar mi cita</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Estado de la cita */}
          <div className="text-center mb-8">
            {isCancelled && (
              <>
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-3xl font-bold text-red-600 mb-2">Cita Cancelada</h2>
                <p className="text-gray-600">Esta cita ha sido cancelada</p>
              </>
            )}
            {isCompleted && (
              <>
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-3xl font-bold text-green-600 mb-2">Cita Completada</h2>
                <p className="text-gray-600">¡Esperamos que hayas disfrutado tu servicio!</p>
              </>
            )}
            {!isCancelled && !isCompleted && (
              <>
                <div className="text-6xl mb-4">📅</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {isPast ? "Cita Programada" : "Tu Cita Confirmada"}
                </h2>
                <p className="text-gray-600">
                  {isPast 
                    ? "Esta cita ya pasó. Si tienes dudas, contáctanos." 
                    : "Aquí están los detalles de tu cita confirmada"
                  }
                </p>
              </>
            )}
          </div>

          {/* Detalles de la cita */}
          <div className={`rounded-2xl p-8 border ${
            isCancelled 
              ? "bg-red-50 border-red-200" 
              : isCompleted 
              ? "bg-green-50 border-green-200"
              : "bg-gradient-to-br from-yellow-50 to-pink-50 border-yellow-200"
          }`}>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Información del servicio */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalles del Servicio</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Servicio:</span>
                    <span className="font-medium">{appointment.service.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio:</span>
                    <span className="font-medium text-green-600">
                      ${appointment.priceCOP.toLocaleString("es-CO")} COP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duración:</span>
                    <span className="font-medium">{appointment.service.durationMin} minutos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-medium">{date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora:</span>
                    <span className="font-medium">{time} - {endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`font-medium ${
                      appointment.status === "confirmed" ? "text-green-600" :
                      appointment.status === "cancelled" ? "text-red-600" :
                      appointment.status === "completed" ? "text-blue-600" :
                      "text-yellow-600"
                    }`}>
                      {appointment.status === "confirmed" ? "Confirmada" :
                       appointment.status === "cancelled" ? "Cancelada" :
                       appointment.status === "completed" ? "Completada" :
                       "Pendiente"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información del cliente */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Cliente</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">Nombre:</span>
                    <div className="font-medium">{appointment.clientName}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Teléfono:</span>
                    <div className="font-medium">{appointment.phoneWhatsApp}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Barrio:</span>
                    <div className="font-medium">{appointment.neighborhood}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Dirección:</span>
                    <div className="font-medium">{appointment.address}</div>
                  </div>
                  {appointment.notes && (
                    <div>
                      <span className="text-gray-600">Notas:</span>
                      <div className="font-medium">{appointment.notes}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Reservada:</span>
                    <div className="font-medium">
                      {new Date(appointment.createdAt).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recordatorio de pago (solo para citas activas) */}
            {!isCancelled && !isCompleted && (
              <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600 text-lg">💳</span>
                  <span className="font-semibold text-green-700">Recordatorio de Pago</span>
                </div>
                <p className="text-green-600 text-sm">
                  <strong>Pago al finalizar el servicio:</strong> ${appointment.priceCOP.toLocaleString("es-CO")} COP. 
                  Acepto efectivo, Nequi, Bancolombia o transferencia.
                </p>
              </div>
            )}

            {/* Acciones */}
            <div className="mt-8 space-y-4">
              {/* WhatsApp - siempre disponible */}
              <a
                href={`https://wa.me/573187229548?text=${generateWhatsAppMessage(appointment)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-center"
              >
                📱 Contactar por WhatsApp
              </a>

              {/* Descargar calendario - solo para citas futuras o no canceladas */}
              {!isCancelled && (
                <a
                  href={`/api/appointments/${appointment.bookingPublicToken}/ics`}
                  download
                  className="block w-full bg-luxury-gold text-white px-6 py-4 rounded-lg hover:bg-luxury-gold/90 transition-colors font-semibold text-center"
                >
                  📅 Agregar a mi Calendario
                </a>
              )}

              {/* Cancelar - solo para citas futuras no canceladas */}
              {!isPast && !isCancelled && !isCompleted && (
                <button
                  onClick={cancelAppointment}
                  disabled={isUpdating}
                  className="block w-full bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Cancelando..." : "❌ Cancelar Cita"}
                </button>
              )}

              {/* Nueva reserva */}
              <Link
                href="/reservar"
                className="block w-full bg-yellow-500 text-white px-6 py-4 rounded-lg hover:bg-yellow-600 transition-colors font-semibold text-center"
              >
                📅 Hacer Nueva Reserva
              </Link>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p className="mb-2">
              Token de cita: <code className="bg-gray-100 px-2 py-1 rounded">{appointment.bookingPublicToken}</code>
            </p>
            <p>
              Guarda este enlace para gestionar tu cita en el futuro
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}