// src/types/window.d.ts
export {};

declare global {
  interface Window {
    // Google Analytics gtag function
    gtag?: (command: string, targetId: string, parameters?: any) => void;
    
    // Analytics / engagement (opcional para evitar errores si aún no están cargados)
    trackScrollDepth?: (percentage: number) => void;
    trackTimeOnPage?: (seconds: number) => void;
    trackGalleryInteraction?: (action: string, category: string) => void;
    trackCarouselInteraction?: (action: 'next_slide' | 'prev_slide' | string, service?: string) => void;

    // Usadas en Services.tsx
    trackServiceView?: (serviceName: string) => void;
    trackWhatsAppClick?: () => void;
    
    // Específicas para página de reservas
    trackBookingStep?: (step: string, data?: any) => void;
    trackBookingSuccess?: (appointmentId: string, value: number, serviceId: string) => void;
    trackBookingError?: (error: string, step: string) => void;
  }
}
