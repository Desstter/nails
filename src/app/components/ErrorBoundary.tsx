"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Actualizar el estado para mostrar la UI de fallback la próxima vez que se renderice
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Guardar información detallada del error
    this.setState({
      error,
      errorInfo,
    });

    // Llamar callback personalizado si existe
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log del error para desarrollo/monitoreo
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // En producción, enviar a servicio de monitoreo
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset automático cuando cambian las props críticas
    if (
      hasError &&
      prevProps.resetKeys !== resetKeys &&
      resetKeys &&
      resetKeys.length > 0
    ) {
      const prevKeysArray = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => prevKeysArray[index] !== key
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    // Reset cuando cualquier prop cambie
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Implementación para enviar errores a servicio de monitoreo
    // Como Sentry, LogRocket, etc.
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        timestamp: new Date().toISOString(),
      };

      // Aquí iría la lógica de envío al servicio
      console.error('Error logged:', errorData);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  scheduleReset = (delay: number = 5000) => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, delay);
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Renderizar fallback personalizado si se proporciona
      if (fallback) {
        return fallback;
      }

      // UI de fallback por defecto
      return <DefaultErrorFallback error={error} onReset={this.resetErrorBoundary} />;
    }

    return children;
  }
}

// Componente de fallback por defecto
interface DefaultErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps) {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Algo salió mal
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Ocurrió un error inesperado. Por favor intenta de nuevo.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-left mb-4 p-3 bg-red-50 rounded border text-xs">
            <summary className="cursor-pointer font-medium text-red-700 mb-2">
              Detalles del error (desarrollo)
            </summary>
            <code className="text-red-600 whitespace-pre-wrap break-all">
              {error.toString()}
            </code>
          </details>
        )}

        <button
          onClick={onReset}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}

// Error Boundary específico para imágenes
export function ImageErrorBoundary({ children, fallback }: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-xs text-gray-500">Error de imagen</p>
            </div>
          </div>
        )
      }
      onError={(error) => {
        console.warn('Image component error:', error.message);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Error Boundary para secciones específicas
export function SectionErrorBoundary({ 
  children, 
  sectionName,
  fallback
}: { 
  children: ReactNode; 
  sectionName: string;
  fallback?: ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="py-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sección temporalmente no disponible
              </h3>
              <p className="text-sm text-gray-600">
                La sección &ldquo;{sectionName}&rdquo; está experimentando problemas técnicos. 
                Intenta recargar la página.
              </p>
            </div>
          </div>
        )
      }
      onError={(error) => {
        console.error(`Section "${sectionName}" error:`, error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Hook para reset programático
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  if (error) {
    throw error;
  }

  return { captureError, resetError };
}

export default ErrorBoundary;