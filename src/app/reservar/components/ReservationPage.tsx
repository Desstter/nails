"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DirectBookingFlow from "./DirectBookingFlow";

export default function ReservationPage() {
  const searchParams = useSearchParams();
  const [utmData, setUtmData] = useState({
    source: "",
    medium: "",
    campaign: "",
    content: "",
    term: "",
  });

  useEffect(() => {
    // Capturar parámetros UTM para tracking de redes sociales
    setUtmData({
      source: searchParams.get("utm_source") || "",
      medium: searchParams.get("utm_medium") || "",
      campaign: searchParams.get("utm_campaign") || "",
      content: searchParams.get("utm_content") || "",
      term: searchParams.get("utm_term") || "",
    });

    // Tracking de landing page view
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_view", {
        page_title: "Reserva tu Cita",
        page_location: window.location.href,
        content_group1: "booking_flow",
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-pink-50">
      {/* Header con branding */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">J</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Joangel Nails Studio</h1>
                <p className="text-sm text-gray-600">Manicure Premium a Domicilio</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl">🏆</div>
                <div className="text-xs text-gray-600">15 años</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">👩‍💼</div>
                <div className="text-xs text-gray-600">500+ clientas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">💳</div>
                <div className="text-xs text-gray-600">Pago al finalizar</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-yellow-50 to-pink-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Reserva tu Cita de{" "}
              <span className="bg-gradient-to-r from-yellow-500 to-pink-500 bg-clip-text text-transparent">
                Manicure Premium
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              En la comodidad de tu hogar • Cali y alrededores • Sin pago anticipado
            </p>
            
            {/* Promoción destacada */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 mb-8 shadow-lg">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-2xl">🎉</span>
                <h3 className="text-xl font-bold">¡Descuento Especial!</h3>
                <span className="text-2xl">🎉</span>
              </div>
              <p className="text-lg font-semibold mb-1">
                Reserva online y ahorra <span className="text-yellow-300">$10,000</span> en tu primera cita
              </p>
              <p className="text-sm opacity-90">
                Solo para nuevas clientas • Válido hoy
              </p>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-sm font-medium text-gray-800">Reserva en 2 min</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl mb-2">🧴</div>
                <div className="text-sm font-medium text-gray-800">Higiene certificada</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl mb-2">💚</div>
                <div className="text-sm font-medium text-gray-800">Pago al finalizar</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flujo de reserva principal */}
      <main className="py-12">
        <div className="container mx-auto px-4">
          <DirectBookingFlow utmData={utmData} />
        </div>
      </main>

      {/* Footer simple */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Joangel Nails Studio</h3>
            <p className="text-gray-300">Tu salón de belleza privado en casa</p>
          </div>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
            <span>📱 WhatsApp: +57 318 722 9548</span>
            <span>📍 Cali y alrededores</span>
            <span>🕐 L-V: 9AM-5PM, D: 9AM-12PM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}