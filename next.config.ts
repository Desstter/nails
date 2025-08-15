import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimización automática de imágenes para Google Ads móvil
  images: {
    // Formatos modernos con fallback automático
    formats: ['image/webp', 'image/avif'],
    
    // Cache TTL para performance
    minimumCacheTTL: 60,
    
    // Tamaños responsive automáticos
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Configuraciones para optimización móvil
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Configuración experimental para mejor performance
  experimental: {
    optimizePackageImports: ['next/image'],
  }
};

export default nextConfig;
