"use client";

import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  lcp?: number;    // Largest Contentful Paint
  fid?: number;    // First Input Delay  
  cls?: number;    // Cumulative Layout Shift
  fcp?: number;    // First Contentful Paint
  ttfb?: number;   // Time to First Byte
  imageLoadTime?: number;
  totalImages?: number;
  failedImages?: number;
}

interface PerformanceMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  reportToConsole?: boolean;
  reportToService?: boolean;
}

export default function PerformanceMonitor({
  onMetricsUpdate,
  reportToConsole = process.env.NODE_ENV === 'development',
  reportToService = process.env.NODE_ENV === 'production'
}: PerformanceMonitorProps) {
  const metricsRef = useRef<PerformanceMetrics>({});
  const observerRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Monitorear Core Web Vitals
    const observeWebVitals = () => {
      try {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
          if (lastEntry) {
            metricsRef.current.lcp = lastEntry.startTime;
            updateMetrics();
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: PerformanceEntry & { processingStart?: number; startTime: number }) => {
            if (entry.processingStart && entry.startTime) {
              metricsRef.current.fid = entry.processingStart - entry.startTime;
              updateMetrics();
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: PerformanceEntry & { hadRecentInput?: boolean; value?: number }) => {
            if (!entry.hadRecentInput && entry.value !== undefined) {
              clsValue += entry.value;
              metricsRef.current.cls = clsValue;
              updateMetrics();
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // First Contentful Paint (FCP)
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: PerformanceEntry & { startTime: number }) => {
            if (entry.name === 'first-contentful-paint') {
              metricsRef.current.fcp = entry.startTime;
              updateMetrics();
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

        observerRef.current = lcpObserver; // Guardar referencia para cleanup

      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    };

    // Monitorear métricas de navegación
    const observeNavigationTiming = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceEntry & { responseStart?: number; requestStart?: number };
        if (navigation && navigation.responseStart && navigation.requestStart) {
          metricsRef.current.ttfb = navigation.responseStart - navigation.requestStart;
          updateMetrics();
        }
      }
    };

    // Monitorear carga de imágenes
    const observeImagePerformance = () => {
      let totalImages = 0;
      let failedImages = 0;
      const imageLoadTimes: number[] = [];

      // Observer para recursos de imagen
      const resourceObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: PerformanceEntry & { initiatorType?: string; responseEnd?: number; startTime: number }) => {
          if (entry.initiatorType === 'img' || 
              entry.name.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
            totalImages++;
            
            if (entry.responseEnd && entry.startTime) {
              const loadTime = entry.responseEnd - entry.startTime;
              imageLoadTimes.push(loadTime);
              
              metricsRef.current.totalImages = totalImages;
              metricsRef.current.imageLoadTime = imageLoadTimes.length > 0 
                ? imageLoadTimes.reduce((a, b) => a + b, 0) / imageLoadTimes.length
                : 0;
              updateMetrics();
            }
          }
        });
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Escuchar errores de imágenes
      const handleImageError = () => {
        failedImages++;
        metricsRef.current.failedImages = failedImages;
        updateMetrics();
      };

      document.addEventListener('error', handleImageError, true);

      return () => {
        document.removeEventListener('error', handleImageError, true);
        resourceObserver.disconnect();
      };
    };

    const updateMetrics = () => {
      const currentMetrics = { ...metricsRef.current };
      
      if (onMetricsUpdate) {
        onMetricsUpdate(currentMetrics);
      }

      if (reportToConsole) {
        console.group('🚀 Performance Metrics');
        console.table(currentMetrics);
        console.groupEnd();
      }

      if (reportToService) {
        sendMetricsToService(currentMetrics);
      }
    };

    // Inicializar observadores
    observeWebVitals();
    observeNavigationTiming();
    const cleanupImageObserver = observeImagePerformance();

    // Report inicial después de que la página esté cargada
    const initialReportTimeout = setTimeout(() => {
      updateMetrics();
    }, 3000);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (cleanupImageObserver) {
        cleanupImageObserver();
      }
      clearTimeout(initialReportTimeout);
    };
  }, [onMetricsUpdate, reportToConsole, reportToService]);

  const sendMetricsToService = (metrics: PerformanceMetrics) => {
    // Implementación para enviar métricas a servicio de análisis
    // Como Google Analytics, Mixpanel, etc.
    try {
      const payload = {
        ...metrics,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        connection: (navigator as { connection?: { effectiveType: string } }).connection?.effectiveType || 'unknown',
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };

      // Aquí iría la lógica de envío al servicio
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Metrics to send:', payload);
      }
      
      // Ejemplo de envío (descomentarizar cuando tengas el endpoint)
      /*
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }).catch(console.error);
      */

    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  };

  // Hook para acceso manual a métricas
  const getMetrics = () => metricsRef.current;

  // Exponer métricas globalmente para debugging
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      (window as { __performanceMetrics?: () => PerformanceMetrics }).__performanceMetrics = getMetrics;
    }
  }, []);

  return null; // Este componente no renderiza nada
}

// Hook para usar métricas en otros componentes
export function usePerformanceMetrics() {
  const metricsRef = useRef<PerformanceMetrics>({});

  const updateMetric = (key: keyof PerformanceMetrics, value: number) => {
    metricsRef.current[key] = value;
  };

  const getMetrics = () => metricsRef.current;

  return { updateMetric, getMetrics };
}

// Componente para mostrar métricas en tiempo real (solo desarrollo)
export function PerformanceDebugger() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <PerformanceMonitor 
        onMetricsUpdate={setMetrics}
        reportToConsole={false}
      />
      
      <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-4 rounded-lg max-w-xs z-50">
        <div className="font-bold mb-2">🚀 Performance</div>
        <div className="space-y-1">
          {metrics.lcp && <div>LCP: {Math.round(metrics.lcp)}ms</div>}
          {metrics.fcp && <div>FCP: {Math.round(metrics.fcp)}ms</div>}
          {metrics.fid && <div>FID: {Math.round(metrics.fid)}ms</div>}
          {metrics.cls && <div>CLS: {metrics.cls.toFixed(3)}</div>}
          {metrics.ttfb && <div>TTFB: {Math.round(metrics.ttfb)}ms</div>}
          {metrics.imageLoadTime && (
            <div>Avg Image: {Math.round(metrics.imageLoadTime)}ms</div>
          )}
          {metrics.totalImages && (
            <div>Images: {metrics.totalImages}</div>
          )}
          {metrics.failedImages && (
            <div className="text-red-400">Failed: {metrics.failedImages}</div>
          )}
        </div>
      </div>
    </>
  );
}