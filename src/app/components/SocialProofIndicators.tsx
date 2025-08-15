"use client";

import { useState, useEffect } from "react";

export default function SocialProofIndicators() {
  const [counters, setCounters] = useState({
    todayBookings: 0,
    weeklyBookings: 0,
    onlineUsers: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Generar números realistas basados en la hora del día
    const generateRealisticNumbers = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Más actividad durante horas pico (10am-2pm, 6pm-9pm)
      const isPeakHour = (hour >= 10 && hour <= 14) || (hour >= 18 && hour <= 21);
      const baseMultiplier = isPeakHour ? 1.5 : 1;
      
      return {
        todayBookings: Math.floor((Math.random() * 8 + 5) * baseMultiplier), // 5-13 (peak: 8-20)
        weeklyBookings: Math.floor(Math.random() * 15 + 25), // 25-40
        onlineUsers: Math.floor((Math.random() * 6 + 2) * baseMultiplier) // 2-8 (peak: 3-12)
      };
    };

    const initialNumbers = generateRealisticNumbers();
    setCounters(initialNumbers);

    // Mostrar después de 3 segundos para no ser intrusivo
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // Actualizar números cada 30-60 segundos para simular actividad real
    const updateInterval = setInterval(() => {
      setCounters(generateRealisticNumbers());
    }, Math.random() * 30000 + 30000); // 30-60 segundos

    return () => {
      clearTimeout(showTimer);
      clearInterval(updateInterval);
    };
  }, []);

  const handleIndicatorClick = (type: string) => {
    // Track social proof interaction
    if (typeof window !== 'undefined' && window.trackWhatsAppClick) {
      window.trackWhatsAppClick();
    }
    
    let message = "";
    if (type === "bookings") {
      message = "Hola! Vi que han tenido muchas reservas hoy. ¿Tienen disponibilidad para mí?";
    } else if (type === "users") {
      message = "Hola! Me interesa reservar una cita. ¿Cuál es su próxima disponibilidad?";
    }
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/573187229548?text=${encodedMessage}`, "_blank");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-4 z-40 space-y-2">
      {/* Indicador de reservas de hoy */}
      {counters.todayBookings > 0 && (
        <div 
          className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
          onClick={() => handleIndicatorClick("bookings")}
        >
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            <span className="font-medium">
              {counters.todayBookings} personas reservaron hoy
            </span>
          </div>
        </div>
      )}

      {/* Indicador de usuarios viendo */}
      {counters.onlineUsers > 1 && (
        <div 
          className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
          onClick={() => handleIndicatorClick("users")}
        >
          <div className="flex items-center gap-2 text-xs">
            <div className="flex -space-x-1">
              {Array.from({ length: Math.min(3, counters.onlineUsers) }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-blue-300 rounded-full border border-blue-500"></div>
              ))}
            </div>
            <span className="font-medium">
              {counters.onlineUsers} personas viendo ahora
            </span>
          </div>
        </div>
      )}

      {/* Indicador semanal (solo en móvil) */}
      <div className="sm:hidden">
        {counters.weeklyBookings > 20 && (
          <div className="bg-purple-500 text-white px-3 py-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-purple-200">📅</span>
              <span className="font-medium">
                {counters.weeklyBookings} citas esta semana
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}