/**
 * Global type declarations for window object extensions
 * Used for Google Ads tracking and analytics
 */
declare global {
  interface Window {
    trackWhatsAppClick?: () => void;
  }
}

export {};