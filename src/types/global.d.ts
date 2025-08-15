// src/types/window.d.ts
export {};

declare global {
  interface Window {
    // Analytics / engagement (opcional para evitar errores si aún no están cargados)
    trackScrollDepth?: (percentage: number) => void;
    trackTimeOnPage?: (seconds: number) => void;
    trackGalleryInteraction?: (action: string, category: string) => void;
    trackCarouselInteraction?: (action: 'next_slide' | 'prev_slide' | string, service?: string) => void;

    // Usadas en Services.tsx
    trackServiceView?: (serviceName: string) => void;
    trackWhatsAppClick?: () => void;
  }
}
