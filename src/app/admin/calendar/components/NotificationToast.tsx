'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon,
  BellIcon
} from '@heroicons/react/24/outline'

export interface NotificationData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  timestamp: number
}

interface NotificationToastProps {
  notifications: NotificationData[]
  onDismiss: (id: string) => void
  className?: string
}

export default function NotificationToast({ notifications, onDismiss, className = '' }: NotificationToastProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<NotificationData[]>([])

  useEffect(() => {
    setVisibleNotifications(notifications)
  }, [notifications])

  useEffect(() => {
    // Auto-dismiss notifications after their duration
    notifications.forEach(notification => {
      if (!notification.persistent && notification.duration) {
        const timer = setTimeout(() => {
          onDismiss(notification.id)
        }, notification.duration)

        return () => clearTimeout(timer)
      }
    })
  }, [notifications, onDismiss])

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
      case 'info':
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-600" />
    }
  }

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900'
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'ahora'
    if (minutes === 1) return 'hace 1 minuto'
    if (minutes < 60) return `hace ${minutes} minutos`
    
    const hours = Math.floor(minutes / 60)
    if (hours === 1) return 'hace 1 hora'
    if (hours < 24) return `hace ${hours} horas`
    
    return new Date(timestamp).toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (visibleNotifications.length === 0) return null

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-3 max-w-sm ${className}`}>
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border shadow-lg transform transition-all duration-300 ease-out ${
            getStyles(notification.type)
          } ${index === 0 ? 'animate-slide-in-right' : ''}`}
          style={{
            animationDelay: `${index * 100}ms`,
            transform: `translateY(${index * 4}px)`,
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm leading-5">
                    {notification.title}
                  </h4>
                  <p className="text-sm opacity-90 mt-1 leading-4">
                    {notification.message}
                  </p>
                  <p className="text-xs opacity-70 mt-2">
                    {formatTime(notification.timestamp)}
                  </p>
                </div>
                
                <button
                  onClick={() => onDismiss(notification.id)}
                  className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/10 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
              
              {notification.action && (
                <div className="mt-3">
                  <button
                    onClick={notification.action.onClick}
                    className="text-sm font-medium underline hover:no-underline"
                  >
                    {notification.action.label}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Estilos CSS personalizados (agregar a globals.css)
const styles = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
`