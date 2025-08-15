"use client";
import { useState } from 'react';
import Image from 'next/image';

/**
 * OPTIMIZED IMAGE COMPONENT - Simplificado para producción
 * 
 * Funcionalidad:
 * - Usa Next.js Image optimization automática (WebP/AVIF)
 * - Loading states y error handling
 * - Calidades por contexto (hero, gallery, lightbox)
 * - Lazy loading inteligente
 * 
 * Next.js se encarga automáticamente de:
 * - Conversión a WebP/AVIF según soporte del navegador
 * - Redimensionado responsive
 * - Optimización de carga
 */

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
  context?: 'hero' | 'gallery-thumb' | 'gallery-full' | 'general';
}

// Configuración de calidad por contexto de uso
const QUALITY_BY_CONTEXT = {
  'hero': 85,           // Alta calidad para conversión
  'gallery-thumb': 60,  // Suficiente para thumbnails
  'gallery-full': 90,   // Máxima calidad para lightbox
  'general': 80         // Calidad estándar
};

// Sizes responsive por contexto
const SIZES_BY_CONTEXT = {
  'hero': '(max-width: 768px) 100vw, 50vw',
  'gallery-thumb': '(max-width: 768px) 50vw, 25vw', 
  'gallery-full': '90vw',
  'general': '(max-width: 768px) 100vw, 50vw'
};

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false,
  quality,
  sizes,
  fill = false,
  style,
  onClick,
  context = 'general'
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  // Determinar calidad y sizes por contexto si no se especifican
  const finalQuality = quality || QUALITY_BY_CONTEXT[context];
  const finalSizes = sizes || SIZES_BY_CONTEXT[context];

  const handleError = () => {
    setHasError(true);
  };

  const imageProps = {
    src,
    alt,
    loading,
    priority,
    quality: finalQuality,
    sizes: finalSizes,
    onError: handleError,
    onClick
  };

  // Usar siempre dimensiones fijas - evitar position absolute de fill
  const finalWidth = width || 500;
  const finalHeight = height || 500;

  return (
    <Image
      {...imageProps}
      width={finalWidth}
      height={finalHeight}
      className={`${className} ${fill ? 'w-full h-full object-cover' : ''}`}
      style={style}
      alt={alt}
    />
  );
}