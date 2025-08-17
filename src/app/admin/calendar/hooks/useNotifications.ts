'use client'

import { useState, useCallback } from 'react'
import type { NotificationData } from '../components/NotificationToast'

export interface UseNotificationsReturn {
  notifications: NotificationData[]
  addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp'>) => void
  dismissNotification: (id: string) => void
  clearAll: () => void
  notifySuccess: (title: string, message: string, options?: Partial<NotificationData>) => void
  notifyError: (title: string, message: string, options?: Partial<NotificationData>) => void
  notifyWarning: (title: string, message: string, options?: Partial<NotificationData>) => void
  notifyInfo: (title: string, message: string, options?: Partial<NotificationData>) => void
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  const addNotification = useCallback((notification: Omit<NotificationData, 'id' | 'timestamp'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const timestamp = Date.now()
    
    const newNotification: NotificationData = {
      id,
      timestamp,
      duration: 5000, // 5 seconds default
      persistent: false,
      ...notification,
    }

    setNotifications(prev => {
      // Limit to 5 notifications maximum
      const updated = [newNotification, ...prev].slice(0, 5)
      return updated
    })

    // Log notification for debugging
    console.log(`🔔 Notification: [${notification.type.toUpperCase()}] ${notification.title} - ${notification.message}`)
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const notifySuccess = useCallback((title: string, message: string, options?: Partial<NotificationData>) => {
    addNotification({
      type: 'success',
      title,
      message,
      ...options,
    })
  }, [addNotification])

  const notifyError = useCallback((title: string, message: string, options?: Partial<NotificationData>) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: 8000, // Errors stay longer
      ...options,
    })
  }, [addNotification])

  const notifyWarning = useCallback((title: string, message: string, options?: Partial<NotificationData>) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration: 6000,
      ...options,
    })
  }, [addNotification])

  const notifyInfo = useCallback((title: string, message: string, options?: Partial<NotificationData>) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration: 4000,
      ...options,
    })
  }, [addNotification])

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
  }
}