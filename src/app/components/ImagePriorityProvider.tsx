"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Configuración de prioridades por página/sección
interface PriorityConfig {
  hero: number;           // Imágenes above-the-fold (priority=true)
  aboveFold: number;      // Imágenes visibles sin scroll (loading="eager")
  nearFold: number;       // Imágenes cerca del fold (loading="lazy" pero preload)
  belowFold: number;      // Imágenes bajo el fold (loading="lazy")
}

// Configuración por defecto siguiendo estándares de performance
const DEFAULT_PRIORITY_CONFIG: PriorityConfig = {
  hero: 1,        // Solo 1 imagen hero con priority
  aboveFold: 4,   // Las primeras 4 imágenes above-fold
  nearFold: 8,    // Las siguientes 8 imágenes near-fold
  belowFold: Infinity // Resto sin prioridad
};

// Configuraciones específicas por página
const PAGE_CONFIGS: Record<string, PriorityConfig> = {
  home: {
    hero: 1,
    aboveFold: 6,    // Más imágenes en home
    nearFold: 12,
    belowFold: Infinity
  },
  gallery: {
    hero: 2,        // 2 imágenes de categoría hero
    aboveFold: 8,   // Más imágenes en galería
    nearFold: 16,
    belowFold: Infinity
  },
  category: {
    hero: 1,
    aboveFold: 6,
    nearFold: 12,
    belowFold: Infinity
  }
};

interface ImagePriorityContextType {
  shouldUsePriority: (index: number, context?: string) => boolean;
  getLoadingStrategy: (index: number, context?: string) => 'eager' | 'lazy';
  shouldPreload: (index: number, context?: string) => boolean;
  getFetchPriority: (index: number, context?: string) => 'high' | 'low' | 'auto';
  getQuality: (index: number, context?: string) => number;
  getSizes: (context: string, index?: number) => string;
  setPageContext: (page: string) => void;
  registerImageLoad: (id: string) => void;
  getImageStats: () => { loaded: number; total: number };
}

const ImagePriorityContext = createContext<ImagePriorityContextType | null>(null);

interface ImagePriorityProviderProps {
  children: ReactNode;
  page?: string;
}

export function ImagePriorityProvider({ children, page = 'home' }: ImagePriorityProviderProps) {
  const [currentPage, setCurrentPage] = useState(page);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [totalImages] = useState(0);

  // Obtener configuración para la página actual
  const config = PAGE_CONFIGS[currentPage] || DEFAULT_PRIORITY_CONFIG;

  // Detectar viewport para ajustar estrategias
  const [, setIsDesktop] = useState(true);
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast'>('fast');

  useEffect(() => {
    // Detectar viewport
    const checkViewport = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Detectar velocidad de conexión
    const checkConnection = () => {
      const nav = navigator as { connection?: { effectiveType: string } };
      if (nav.connection) {
        const effectiveType = nav.connection.effectiveType;
        setConnectionSpeed(effectiveType === 'slow-2g' || effectiveType === '2g' ? 'slow' : 'fast');
      }
    };

    checkViewport();
    checkConnection();

    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Determinar si una imagen debe usar priority
  const shouldUsePriority = (index: number, context?: string): boolean => {
    // Reglas estrictas para priority (solo imágenes críticas)
    if (context === 'hero' || context === 'lightbox') return index < config.hero;
    if (context === 'category-hero') return index === 0;
    if (context === 'gallery') return index < Math.min(config.hero, 2);
    
    return index < config.hero;
  };

  // Determinar estrategia de loading
  const getLoadingStrategy = (index: number, context?: string): 'eager' | 'lazy' => {
    // Si tiene priority, debe ser eager
    if (shouldUsePriority(index, context)) return 'eager';
    
    // Above-fold images
    if (index < config.aboveFold) return 'eager';
    
    // Ajustar para conexiones lentas
    if (connectionSpeed === 'slow' && index < config.aboveFold / 2) return 'eager';
    
    return 'lazy';
  };

  // Determinar si debe precargar
  const shouldPreload = (index: number, context?: string): boolean => {
    // Solo precargar imágenes críticas
    if (context === 'hero') return index < 1;
    if (context === 'category-hero') return index === 0;
    if (context === 'lightbox') return true;
    
    return false;
  };

  // Determinar fetch priority
  const getFetchPriority = (index: number, context?: string): 'high' | 'low' | 'auto' => {
    if (shouldUsePriority(index, context)) return 'high';
    if (index < config.aboveFold) return 'auto';
    return 'low';
  };

  // Determinar calidad optimizada
  const getQuality = (index: number, context?: string): number => {
    // Calidades diferenciadas por contexto y posición
    if (context === 'lightbox') return 90;           // Máxima calidad para vista detallada
    if (context === 'hero') return 85;               // Alta calidad para hero
    if (shouldUsePriority(index, context)) return 85; // Alta calidad para priority
    if (index < config.aboveFold) return 80;         // Buena calidad above-fold
    
    // Ajustar para conexiones lentas
    if (connectionSpeed === 'slow') return Math.max(70, 80 - index * 2);
    
    return 75; // Calidad estándar para el resto
  };

  // Determinar sizes attribute optimizado
  const getSizes = (context: string): string => {
    const sizeMap: Record<string, string> = {
      'hero': '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw',
      'category-card': '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw',
      'gallery-grid': '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw',
      'gallery-thumb': '(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw',
      'lightbox': '90vw',
      'before-after': '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
      'testimonial': '(max-width: 640px) 80px, 100px'
    };

    return sizeMap[context] || '(max-width: 640px) 100vw, 50vw';
  };

  // Cambiar contexto de página
  const setPageContext = (page: string) => {
    setCurrentPage(page);
  };

  // Registrar carga de imagen para estadísticas
  const registerImageLoad = (id: string) => {
    setLoadedImages(prev => new Set([...prev, id]));
  };

  // Obtener estadísticas de carga
  const getImageStats = () => {
    return {
      loaded: loadedImages.size,
      total: totalImages
    };
  };

  // Preload crítico para imágenes importantes
  useEffect(() => {
    if (typeof window !== 'undefined' && currentPage === 'gallery') {
      // Precargar la primera imagen de cada categoría si están disponibles
      const criticalImages = [
        '/Manicura elegante con detalles dorados.png',
        '/Arte de uñas moderno y detallado.png',
        '/gel-dorado.png'
      ];

      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    }
  }, [currentPage]);

  const value: ImagePriorityContextType = {
    shouldUsePriority,
    getLoadingStrategy,
    shouldPreload,
    getFetchPriority,
    getQuality,
    getSizes,
    setPageContext,
    registerImageLoad,
    getImageStats
  };

  return (
    <ImagePriorityContext.Provider value={value}>
      {children}
    </ImagePriorityContext.Provider>
  );
}

// Hook para usar el contexto de prioridades
export function useImagePriority() {
  const context = useContext(ImagePriorityContext);
  
  if (!context) {
    throw new Error('useImagePriority must be used within an ImagePriorityProvider');
  }
  
  return context;
}

// Hook de conveniencia para props de imagen optimizada
export function useOptimizedImageProps(
  index: number, 
  context: string,
  overrides?: Partial<{
    priority: boolean;
    loading: 'eager' | 'lazy';
    quality: number;
    sizes: string;
  }>
) {
  const {
    shouldUsePriority,
    getLoadingStrategy,
    shouldPreload,
    getFetchPriority,
    getQuality,
    getSizes
  } = useImagePriority();

  return {
    priority: overrides?.priority ?? shouldUsePriority(index, context),
    loading: overrides?.loading ?? getLoadingStrategy(index, context),
    preload: shouldPreload(index, context),
    fetchPriority: getFetchPriority(index, context),
    quality: overrides?.quality ?? getQuality(index, context),
    sizes: overrides?.sizes ?? getSizes(context, index)
  };
}