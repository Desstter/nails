"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';

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
}

// Mapeo de nombres de archivos originales a nombres optimizados
const imageMapping: Record<string, string> = {
  "Arte celestial en uñas elegantes": "arte-celestial-en-uñas-elegantes",
  "Arte de uñas con detalles botánicos": "arte-de-uñas-con-detalles-botánicos",
  "Arte de uñas con detalles gráficos": "arte-de-uñas-con-detalles-gráficos",
  "Arte de uñas con diseño botánico y geométrico": "arte-de-uñas-con-diseño-botánico-y-geométrico",
  "Arte de uñas con mariposas y amor": "arte-de-uñas-con-mariposas-y-amor",
  "Arte de uñas con Ojos Turcos": "arte-de-uñas-con-ojos-turcos",
  "Arte de uñas detallado y vibrante": "arte-de-uñas-detallado-y-vibrante",
  "Arte de uñas elegante y detallado (2)": "arte-de-uñas-elegante-y-detallado-2",
  "Arte de uñas elegante y detallado (3)": "arte-de-uñas-elegante-y-detallado-3",
  "Arte de uñas elegante y detallado": "arte-de-uñas-elegante-y-detallado",
  "Arte de uñas moderno y detallado": "arte-de-uñas-moderno-y-detallado",
  "Arte de Uñas Navideñas Elegante": "arte-de-uñas-navideñas-elegante",
  "Arte de uñas navideño con Santa": "arte-de-uñas-navideño-con-santa",
  "Arte de uñas para Halloween": "arte-de-uñas-para-halloween",
  "Arte de uñas vibrante y moderno": "arte-de-uñas-vibrante-y-moderno",
  "Arte en uñas con detalles geométricos": "arte-en-uñas-con-detalles-geométricos",
  "Arte en uñas con tips verde neón": "arte-en-uñas-con-tips-verde-neón",
  "Arte en Uñas con Toque Pop": "arte-en-uñas-con-toque-pop",
  "Detalles elegantes de manicura francesa": "detalles-elegantes-de-manicura-francesa",
  "Diseño de uñas acrílicas coloridas": "diseño-de-uñas-acrílicas-coloridas",
  "Diseño de uñas con detalles dorados": "diseño-de-uñas-con-detalles-dorados",
  "Diseño de uñas rojo y blanco": "diseño-de-uñas-rojo-y-blanco",
  "Diseño minimalista en uñas acrílicas": "diseño-minimalista-en-uñas-acrílicas",
  "french-clasico": "french-clasico",
  "gel-dorado": "gel-dorado",
  "Manicura Elegante con Brillo Dorado": "manicura-elegante-con-brillo-dorado",
  "Manicura elegante con detalles dorados": "manicura-elegante-con-detalles-dorados",
  "Manicura francesa con corazones abstractos (1)": "manicura-francesa-con-corazones-abstractos-1",
  "Manicura francesa con corazones abstractos": "manicura-francesa-con-corazones-abstractos",
  "Manicura francesa con ojos de mal de ojo": "manicura-francesa-con-ojos-de-mal-de-ojo",
  "Manicura rosa con copos de nieve": "manicura-rosa-con-copos-de-nieve",
  "Manicure elegante con detalles dorados": "manicure-elegante-con-detalles-dorados",
  "Mano descansando sobre toalla blanca": "mano-descansando-sobre-toalla-blanca",
  "nail-geometrico": "nail-geometrico",
  "Uñas con arte de copos de nieve": "uñas-con-arte-de-copos-de-nieve",
  "Uñas de arte pop y diseño": "uñas-de-arte-pop-y-diseño"
};

function cleanImageName(src: string): string {
  // Extraer nombre del archivo sin extensión
  const fileName = src.split('/').pop()?.split('.')[0] || '';
  
  // Buscar en el mapping primero
  if (imageMapping[fileName]) {
    return imageMapping[fileName];
  }
  
  // Si no está en el mapping, limpiar el nombre
  return fileName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/--+/g, '-');
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false,
  quality = 90,
  sizes,
  fill = false,
  style,
  onClick
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Determinar si la imagen está en el directorio optimizado
  const isOptimizedPath = src.startsWith('/optimized/') || src.includes('optimized');
  
  // Generar rutas para diferentes formatos
  const cleanName = cleanImageName(src);
  const baseOptimizedPath = `/optimized/${cleanName}`;
  
  const imageSources = isOptimizedPath ? [src] : [
    `${baseOptimizedPath}.avif`,
    `${baseOptimizedPath}.webp`,
    src // Fallback original
  ];

  useEffect(() => {
    if (isOptimizedPath) {
      setCurrentSrc(src);
      return;
    }

    // Probar formatos en orden de preferencia
    async function findBestFormat() {
      setIsLoading(true);
      setHasError(false);
      
      for (const imageSrc of imageSources) {
        try {
          // Verificar si la imagen existe
          const response = await fetch(imageSrc, { method: 'HEAD' });
          if (response.ok) {
            setCurrentSrc(imageSrc);
            setIsLoading(false);
            return;
          }
        } catch {
          // Continuar con el siguiente formato
          continue;
        }
      }
      
      // Si ningún formato optimizado funciona, usar el original
      setCurrentSrc(src);
      setIsLoading(false);
    }

    findBestFormat();
  }, [src, imageSources, isOptimizedPath]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    // Si hay error y no es la imagen original, intentar con la original
    if (currentSrc !== src) {
      setCurrentSrc(src);
    }
  };

  const imageProps = {
    src: currentSrc,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    loading,
    priority,
    quality,
    sizes,
    onLoad: handleLoad,
    onError: handleError,
    style,
    onClick
  };

  // Renderizar con o sin dimensiones fijas
  if (fill) {
    return (
      <div className={`relative ${className}`} style={style} onClick={onClick}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
        )}
        <Image
          {...imageProps}
          fill
          className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          alt={alt || ''}
        />
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
            <span>🖼️ Imagen no disponible</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      {isLoading && width && height && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded z-10"
          style={{ width, height }}
        />
      )}
      <Image
        {...imageProps}
        width={width}
        height={height}
        alt={alt || ''}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
          <span>🖼️ Imagen no disponible</span>
        </div>
      )}
    </div>
  );
}

// Hook para precargar imágenes optimizadas
export function usePreloadImages(imagePaths: string[]) {
  useEffect(() => {
    imagePaths.forEach(path => {
      const cleanName = cleanImageName(path);
      const avifSrc = `/optimized/${cleanName}.avif`;
      const webpSrc = `/optimized/${cleanName}.webp`;
      
      // Precargar AVIF si el navegador lo soporta
      if (typeof window !== 'undefined') {
        const link1 = document.createElement('link');
        link1.rel = 'preload';
        link1.as = 'image';
        link1.href = avifSrc;
        link1.type = 'image/avif';
        document.head.appendChild(link1);
        
        const link2 = document.createElement('link');
        link2.rel = 'preload';
        link2.as = 'image';
        link2.href = webpSrc;
        link2.type = 'image/webp';
        document.head.appendChild(link2);
      }
    });
  }, [imagePaths]);
}