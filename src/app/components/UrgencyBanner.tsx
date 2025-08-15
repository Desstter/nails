"use client";

import { useState, useEffect } from "react";

interface UrgencyBannerProps {
  className?: string;
}

export default function UrgencyBanner({ className = "" }: UrgencyBannerProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Mensajes de urgencia/escasez rotativos
  const urgencyMessages = [
    {
      icon: "🔥",
      text: "Alta demanda: Solo 3 citas disponibles esta semana",
      variant: "warning" as const,
      action: "Ver disponibilidad"
    },
    {
      icon: "⏰",
      text: "12 personas reservaron en las últimas 24 horas",
      variant: "success" as const,
      action: "Reservar ahora"
    },
    {
      icon: "💎",
      text: "Promoción 2x1 solo para nuevas clientas - Últimos días",
      variant: "premium" as const,
      action: "Aprovechar oferta"
    },
    {
      icon: "📍",
      text: "Servicio en tu zona: Disponible hoy y mañana",
      variant: "info" as const,
      action: "Consultar horarios"
    }
  ];

  // Rotar mensajes cada 8 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % urgencyMessages.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [urgencyMessages.length]);

  // Auto-ocultar después de 45 segundos para no ser intrusivo
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 45000);

    return () => clearTimeout(timeout);
  }, []);

  const handleBannerClick = () => {
    // Track urgency banner interaction
    if (typeof window !== 'undefined' && window.trackWhatsAppClick) {
      window.trackWhatsAppClick();
    }
    
    const message = encodeURIComponent(
      `Hola! Vi que tienen alta demanda. Me interesa reservar una cita lo antes posible. ¿Qué disponibilidad tienen?`
    );
    window.open(`https://wa.me/573187229548?text=${message}`, "_blank");
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const currentMsg = urgencyMessages[currentMessage];
  
  // Estilos por variante
  const variantStyles = {
    warning: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
    success: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    premium: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black",
    info: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
  };

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform ${className}`}
      style={{ transform: isVisible ? 'translateY(0)' : 'translateY(-100%)' }}
    >
      <div 
        className={`${variantStyles[currentMsg.variant]} px-4 py-3 cursor-pointer hover:opacity-90 transition-opacity`}
        onClick={handleBannerClick}
      >
        <div className="container-luxury">
          <div className="flex items-center justify-between gap-4">
            {/* Contenido principal */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-xl flex-shrink-0 animate-pulse">
                {currentMsg.icon}
              </span>
              <p className="font-medium text-sm sm:text-base truncate">
                {currentMsg.text}
              </p>
            </div>

            {/* CTA y botón cerrar */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="hidden sm:inline text-xs font-semibold px-2 py-1 bg-white/20 rounded-full">
                {currentMsg.action}
              </span>
              <button
                onClick={handleClose}
                className="w-6 h-6 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                aria-label="Cerrar banner"
              >
                <span className="text-sm">×</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de progreso */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
        <div 
          className="h-full bg-white/50 transition-all duration-[8000ms] ease-linear"
          style={{ 
            width: `${((currentMessage + 1) / urgencyMessages.length) * 100}%`
          }}
        />
      </div>
    </div>
  );
}