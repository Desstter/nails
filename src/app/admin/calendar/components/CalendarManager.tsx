'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import CalendarView from './CalendarView'
import NotificationToast from './NotificationToast'
import { useNotifications } from '../hooks/useNotifications'
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  BoltIcon,
  CloudIcon,
  SignalIcon
} from '@heroicons/react/24/outline'

interface CalendarStatus {
  isConnected: boolean
  autoCreateEvents: boolean
  sendClientInvites: boolean
  syncBidirectional: boolean
  lastConnection: string | null
}

interface TestResult {
  connected: boolean
  calendarName: string
  timeZone: string
  upcomingEvents: number
  permissions: {
    read: boolean
    write: boolean
  }
}

interface CalendarStats {
  totalAppointments: number
  appointmentsWithGoogleEvent: number
  syncSuccessRate: number
  isConfigured: boolean
  autoCreateEnabled: boolean
  recentEvents: Array<{
    id: string
    clientName: string
    serviceName: string
    startAt: string
    googleEventId: string
    createdAt: string
  }>
  periodDays: number
}

interface TrendData {
  date: string
  totalAppointments: number
  syncedAppointments: number
  syncRate: number
}

interface TrendsResponse {
  trends: TrendData[]
  summary: {
    totalAppointments: number
    syncedAppointments: number
    avgSyncRate: number
    trend: number
    period: number
  }
}

interface HealthCheck {
  status: 'healthy' | 'warning' | 'critical'
  checks: {
    googleCalendarConnection: {
      status: 'ok' | 'error'
      message: string
      lastChecked: string
    }
    database: {
      status: 'ok' | 'error'
      message: string
      lastChecked: string
    }
    recentSyncActivity: {
      status: 'ok' | 'warning' | 'error'
      message: string
      syncRate: number
      lastSyncedAppointment: string | null
    }
    configuration: {
      status: 'ok' | 'warning'
      message: string
      autoCreateEnabled: boolean
      isConfigured: boolean
    }
  }
  overall: {
    uptime: number
    lastHealthCheck: string
    issues: string[]
    recommendations: string[]
  }
}

export default function CalendarManager() {
  const { data: session, status } = useSession()
  const { notifications, dismissNotification, notifySuccess, notifyError, notifyWarning, notifyInfo } = useNotifications()
  const [calendarStatus, setCalendarStatus] = useState<CalendarStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)
  const [stats, setStats] = useState<CalendarStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [trends, setTrends] = useState<TrendsResponse | null>(null)
  const [loadingTrends, setLoadingTrends] = useState(false)
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null)
  const [loadingHealth, setLoadingHealth] = useState(false)
  const [syncingFromGoogle, setSyncingFromGoogle] = useState(false)
  const [syncResults, setSyncResults] = useState<any>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCalendarStatus()
      fetchStats()
      fetchTrends()
      fetchHealthCheck()
    }
  }, [status])

  // Health check automático cada 30 segundos
  useEffect(() => {
    if (status === 'authenticated' && calendarStatus?.isConnected) {
      const interval = setInterval(() => {
        fetchHealthCheck()
      }, 30000) // 30 segundos

      return () => clearInterval(interval)
    }
  }, [status, calendarStatus?.isConnected])

  useEffect(() => {
    // Verificar parámetros URL para mensajes
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const error = urlParams.get('error')
    
    if (success === 'connected') {
      setMessage({ type: 'success', text: 'Google Calendar conectado exitosamente' })
      fetchCalendarStatus()
    } else if (error) {
      const errorMessages: { [key: string]: string } = {
        'authorization_failed': 'Autorización cancelada o fallida',
        'connection_failed': 'Error al conectar con Google Calendar',
      }
      setMessage({ 
        type: 'error', 
        text: errorMessages[error] || 'Error desconocido' 
      })
    }
  }, [])

  const fetchCalendarStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/google-calendar/status')
      
      if (response.ok) {
        const data = await response.json()
        setCalendarStatus(data.data)
      } else {
        setMessage({ type: 'error', text: 'Error al cargar estado del calendario' })
      }
    } catch (error) {
      console.error('Error fetching calendar status:', error)
      setMessage({ type: 'error', text: 'Error al cargar estado del calendario' })
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    try {
      setConnecting(true)
      console.log('🔗 Starting Google Calendar connection...')
      setMessage({ type: 'success', text: 'Iniciando conexión con Google Calendar...' })
      
      const response = await fetch('/api/admin/google-calendar/connect')
      console.log('📡 Connect response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Auth URL generated:', data.data.authUrl)
        setMessage({ type: 'success', text: 'Redirigiendo a Google...' })
        notifyInfo('Conectando...', 'Redirigiendo a Google para autorización')
        
        // Redirigir a Google OAuth
        window.location.href = data.data.authUrl
      } else {
        const errorData = await response.text()
        console.error('❌ Connect failed:', errorData)
        setMessage({ type: 'error', text: 'Error al generar URL de autorización' })
      }
    } catch (error) {
      console.error('❌ Error connecting to Google Calendar:', error)
      setMessage({ type: 'error', text: 'Error al conectar con Google Calendar' })
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!window.confirm('¿Estás segura de desconectar Google Calendar?')) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/admin/google-calendar/disconnect', {
        method: 'POST'
      })
      if (response.ok) {
        setMessage({ type: 'success', text: 'Google Calendar desconectado' })
        setTestResult(null)
        fetchCalendarStatus()
      } else {
        setMessage({ type: 'error', text: 'Error al desconectar' })
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
      setMessage({ type: 'error', text: 'Error al desconectar Google Calendar' })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      setLoadingStats(true)
      const response = await fetch('/api/admin/google-calendar/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching calendar stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchTrends = async () => {
    try {
      setLoadingTrends(true)
      const response = await fetch('/api/admin/google-calendar/trends?days=14')
      if (response.ok) {
        const data = await response.json()
        setTrends(data.data)
      }
    } catch (error) {
      console.error('Error fetching calendar trends:', error)
    } finally {
      setLoadingTrends(false)
    }
  }

  const fetchHealthCheck = async () => {
    try {
      setLoadingHealth(true)
      const response = await fetch('/api/admin/google-calendar/health')
      if (response.ok) {
        const data = await response.json()
        setHealthCheck(data.data)
        
        // Mostrar alerta si hay problemas críticos
        if (data.data.status === 'critical' && data.data.overall.issues.length > 0) {
          setMessage({ 
            type: 'error', 
            text: `Problemas críticos detectados: ${data.data.overall.issues[0]}` 
          })
          notifyError('Sistema crítico', data.data.overall.issues[0], { persistent: true })
        } else if (data.data.status === 'warning' && data.data.overall.issues.length > 0) {
          notifyWarning('Advertencia del sistema', data.data.overall.issues[0])
        }
      }
    } catch (error) {
      console.error('Error fetching health check:', error)
    } finally {
      setLoadingHealth(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      setTesting(true)
      console.log('🧪 Probando conexión con Google Calendar...')
      
      const response = await fetch('/api/admin/google-calendar/test', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (response.ok && data.success) {
        setTestResult(data.data)
        console.log('✅ ¡Conexión exitosa!')
        console.log('📅 Información del calendario:', {
          nombre: data.data.calendarName,
          zona_horaria: data.data.timeZone,
          eventos_proximos: data.data.upcomingEvents,
          permisos: data.data.permissions
        })
        setMessage({ type: 'success', text: '✅ Conexión exitosa - revisa la consola para detalles' })
        notifySuccess('Conexión verificada', `Conectado a "${data.data.calendarName}" con ${data.data.upcomingEvents} eventos próximos`)
      } else {
        setTestResult(null)
        setMessage({ type: 'error', text: data.error?.message || 'Error al probar conexión' })
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      setMessage({ type: 'error', text: 'Error al probar conexión' })
    } finally {
      setTesting(false)
    }
  }

  const handleUpdateSetting = async (setting: string, value: boolean) => {
    try {
      setSavingSettings(true)
      const response = await fetch('/api/admin/google-calendar/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [setting]: value })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setCalendarStatus(prev => prev ? { ...prev, [setting]: value } : null)
        setMessage({ type: 'success', text: 'Configuración actualizada' })
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Error al actualizar' })
      }
    } catch (error) {
      console.error('Error updating setting:', error)
      setMessage({ type: 'error', text: 'Error al actualizar configuración' })
    } finally {
      setSavingSettings(false)
    }
  }

  const handleSyncFromGoogle = async () => {
    try {
      setSyncingFromGoogle(true)
      setSyncResults(null)
      setMessage({ type: 'success', text: 'Iniciando sincronización desde Google Calendar...' })
      
      const response = await fetch('/api/admin/google-calendar/sync-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daysBack: 7,
          daysForward: 30
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setSyncResults(data.data)
        const { importedCount, skippedCount, errorCount } = data.data.summary
        setMessage({ 
          type: 'success', 
          text: `Sincronización completada: ${importedCount} importadas, ${skippedCount} omitidas, ${errorCount} errores` 
        })
        
        // Notificaciones específicas basadas en resultados
        if (importedCount > 0) {
          notifySuccess('Sincronización exitosa', `${importedCount} citas importadas desde Google Calendar`)
        }
        if (skippedCount > 0) {
          notifyWarning('Eventos omitidos', `${skippedCount} eventos no se importaron (duplicados o no relacionados)`)
        }
        if (errorCount > 0) {
          notifyError('Errores en sincronización', `${errorCount} eventos no se pudieron procesar`)
        }
        if (importedCount === 0 && skippedCount === 0 && errorCount === 0) {
          notifyInfo('Sin cambios', 'No se encontraron eventos nuevos para importar')
        }
        
        // Refrescar estadísticas después de la sincronización
        fetchStats()
        fetchTrends()
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Error al sincronizar' })
      }
    } catch (error) {
      console.error('Error syncing from Google:', error)
      setMessage({ type: 'error', text: 'Error al sincronizar desde Google Calendar' })
    } finally {
      setSyncingFromGoogle(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
          <p className="text-charcoal">Cargando...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-playfair text-charcoal mb-4">Acceso Denegado</h1>
          <Link href="/admin/login" className="bg-luxury-gold text-white px-6 py-2 rounded-lg">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-luxury-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-charcoal/60 hover:text-luxury-gold transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-playfair font-bold text-charcoal">
                  Google Calendar
                </h1>
                <p className="text-charcoal/60 mt-1">
                  Sincronización automática de tu agenda personal
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensaje de estado */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Estados de Salud del Sistema */}
        {healthCheck && calendarStatus?.isConnected && (
          <div className={`p-4 rounded-lg border-l-4 mb-6 ${
            healthCheck.status === 'healthy' 
              ? 'bg-green-50 border-green-500' 
              : healthCheck.status === 'warning'
              ? 'bg-yellow-50 border-yellow-500'
              : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  healthCheck.status === 'healthy' 
                    ? 'bg-green-500' 
                    : healthCheck.status === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}></div>
                <div>
                  <h3 className={`font-medium ${
                    healthCheck.status === 'healthy' 
                      ? 'text-green-900' 
                      : healthCheck.status === 'warning'
                      ? 'text-yellow-900'
                      : 'text-red-900'
                  }`}>
                    Sistema {
                      healthCheck.status === 'healthy' 
                        ? 'Saludable' 
                        : healthCheck.status === 'warning'
                        ? 'Con Advertencias'
                        : 'Crítico'
                    }
                  </h3>
                  <p className={`text-sm ${
                    healthCheck.status === 'healthy' 
                      ? 'text-green-700' 
                      : healthCheck.status === 'warning'
                      ? 'text-yellow-700'
                      : 'text-red-700'
                  }`}>
                    Última verificación: {new Date(healthCheck.overall.lastHealthCheck).toLocaleTimeString('es-CO')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Indicadores rápidos */}
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    healthCheck.checks.googleCalendarConnection.status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                  }`} title="Google Calendar"></div>
                  <span className="hidden sm:inline">Calendar</span>
                  
                  <div className={`w-2 h-2 rounded-full ${
                    healthCheck.checks.database.status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                  }`} title="Base de Datos"></div>
                  <span className="hidden sm:inline">DB</span>
                  
                  <div className={`w-2 h-2 rounded-full ${
                    healthCheck.checks.recentSyncActivity.status === 'ok' ? 'bg-green-500' : 
                    healthCheck.checks.recentSyncActivity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} title="Sincronización"></div>
                  <span className="hidden sm:inline">Sync</span>
                </div>

                <button
                  onClick={fetchHealthCheck}
                  disabled={loadingHealth}
                  className="text-xs px-3 py-1 rounded-full bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  {loadingHealth ? '🔄' : '↻'} Verificar
                </button>
              </div>
            </div>

            {/* Detalles expandibles */}
            {(healthCheck.overall.issues.length > 0 || healthCheck.overall.recommendations.length > 0) && (
              <div className="mt-4 space-y-2">
                {healthCheck.overall.issues.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-900 mb-1">⚠️ Problemas Detectados:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {healthCheck.overall.issues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {healthCheck.overall.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">💡 Recomendaciones:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {healthCheck.overall.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
            <p className="text-charcoal">Cargando configuración...</p>
          </div>
        ) : calendarStatus ? (
          <div className="space-y-6">
            {/* Estado de conexión */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    calendarStatus.isConnected 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    <CalendarDaysIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-playfair font-bold text-charcoal">
                      {calendarStatus.isConnected ? 'Conectado' : 'Desconectado'}
                    </h2>
                    <p className="text-charcoal/60">
                      {calendarStatus.isConnected 
                        ? 'Sincronización activa con Google Calendar'
                        : 'Google Calendar no está conectado'
                      }
                    </p>
                    {calendarStatus.lastConnection && (
                      <p className="text-sm text-charcoal/50 mt-1">
                        Última conexión: {new Date(calendarStatus.lastConnection).toLocaleDateString('es-CO')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="text-xs bg-blue-100 px-2 py-1 rounded">
                    Botón: {calendarStatus.isConnected ? 'Desconectar' : 'Conectar'}
                  </div>
                  {calendarStatus.isConnected ? (
                    <>
                      <button
                        onClick={handleTestConnection}
                        disabled={testing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {testing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Probando...
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-4 w-4" />
                            Probar Conexión
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleDisconnect}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Desconectar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => {
                        console.log('🖱️ Button clicked!', e);
                        setMessage({ type: 'success', text: 'Botón clickeado - iniciando...' });
                        handleConnect();
                      }}
                      disabled={connecting}
                      className="px-6 py-3 bg-luxury-gold text-white rounded-lg hover:bg-luxury-gold/90 transition-colors disabled:opacity-50 flex items-center gap-2 border-2 border-luxury-gold font-semibold text-lg cursor-pointer"
                      style={{ zIndex: 10 }}
                    >
                      {connecting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Conectando...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="h-4 w-4" />
                          Conectar Google Calendar
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Dashboard de Métricas del Sistema */}
            {calendarStatus.isConnected && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Estado de Conexión */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-green-900 uppercase tracking-wide">Estado de Conexión</h3>
                      <p className="text-2xl font-bold text-green-600 mt-2">Activo</p>
                      <p className="text-xs text-green-700 mt-1">
                        <SignalIcon className="h-3 w-3 inline mr-1" />
                        Sincronizado
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <CloudIcon className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Tasa de Sincronización */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-blue-900 uppercase tracking-wide">Sincronización</h3>
                      <p className="text-2xl font-bold text-blue-600 mt-2">
                        {stats ? `${stats.syncSuccessRate}%` : '—'}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        <BoltIcon className="h-3 w-3 inline mr-1" />
                        Tasa de éxito
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <ChartBarIcon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Configuración Activa */}
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-purple-900 uppercase tracking-wide">Auto-Crear</h3>
                      <p className="text-2xl font-bold text-purple-600 mt-2">
                        {calendarStatus.autoCreateEvents ? 'ON' : 'OFF'}
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        <ClockIcon className="h-3 w-3 inline mr-1" />
                        Eventos automáticos
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <CogIcon className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gráfico de Tendencias */}
            {trends && calendarStatus?.isConnected && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-playfair font-bold text-gray-900 flex items-center gap-2">
                    <ChartBarIcon className="h-5 w-5 text-gray-600" />
                    Tendencias de Sincronización
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${trends.summary.trend >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm font-medium ${trends.summary.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trends.summary.trend >= 0 ? '+' : ''}{trends.summary.trend.toFixed(1)}% últimos 7 días
                      </span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      Últimos {trends.summary.period} días
                    </span>
                  </div>
                </div>

                {/* Gráfico Simple de Barras */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{trends.summary.totalAppointments}</p>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Total citas</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{trends.summary.syncedAppointments}</p>
                      <p className="text-xs text-green-800 uppercase tracking-wide">Sincronizadas</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{trends.summary.avgSyncRate}%</p>
                      <p className="text-xs text-blue-800 uppercase tracking-wide">Promedio sync</p>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <p className={`text-2xl font-bold ${trends.summary.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trends.summary.trend >= 0 ? '+' : ''}{trends.summary.trend.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Tendencia</p>
                    </div>
                  </div>

                  {/* Gráfico visual simple */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Tasa de sincronización diaria (%)</span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          <span className="text-xs">Sync Rate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span className="text-xs">Citas</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative h-32 bg-gray-50 rounded-lg p-4 overflow-x-auto">
                      <div className="flex items-end justify-between h-full gap-1 min-w-max">
                        {trends.trends.slice(-7).map((day, index) => {
                          const maxRate = 100
                          const maxAppointments = Math.max(...trends.trends.map(d => d.totalAppointments)) || 1
                          const syncHeight = (day.syncRate / maxRate) * 100
                          const appointmentHeight = (day.totalAppointments / maxAppointments) * 100
                          
                          return (
                            <div key={day.date} className="flex flex-col items-center gap-2 min-w-[60px]">
                              <div className="relative h-20 w-8 bg-gray-200 rounded-sm overflow-hidden">
                                <div 
                                  className="absolute bottom-0 w-full bg-blue-500 transition-all duration-300"
                                  style={{ height: `${syncHeight}%` }}
                                  title={`Sync Rate: ${day.syncRate}%`}
                                />
                                <div 
                                  className="absolute bottom-0 right-0 w-2 bg-green-500 transition-all duration-300"
                                  style={{ height: `${appointmentHeight}%` }}
                                  title={`Citas: ${day.totalAppointments}`}
                                />
                              </div>
                              <div className="text-xs text-gray-600 text-center">
                                <div className="font-medium">{day.syncRate}%</div>
                                <div>{new Date(day.date).toLocaleDateString('es-CO', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 text-center mt-2">
                      Últimos 7 días • Barras azules: % sincronización • Barras verdes: cantidad de citas
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información de prueba de conexión */}
            {testResult && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-playfair font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  Información del Calendario Conectado
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CalendarDaysIcon className="h-5 w-5 text-gray-600" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Calendario:</span>
                        <p className="text-gray-900 font-medium">{testResult.calendarName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <ClockIcon className="h-5 w-5 text-gray-600" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Zona Horaria:</span>
                        <p className="text-gray-900 font-medium">{testResult.timeZone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <UserGroupIcon className="h-5 w-5 text-gray-600" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Eventos próximos:</span>
                        <p className="text-gray-900 font-medium">{testResult.upcomingEvents}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-gray-600" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Permisos:</span>
                        <p className="text-gray-900 font-medium">
                          {testResult.permissions.read && testResult.permissions.write ? (
                            <span className="text-green-600">✅ Completos</span>
                          ) : (
                            <span className="text-amber-600">⚠️ Limitados</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Configuraciones */}
            {calendarStatus.isConnected && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10">
                <h3 className="text-lg font-playfair font-bold text-charcoal mb-4 flex items-center gap-2">
                  <CogIcon className="h-5 w-5" />
                  Configuración de Sincronización
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-cream/30 rounded-lg">
                    <div>
                      <h4 className="font-medium text-charcoal">Crear eventos automáticamente</h4>
                      <p className="text-sm text-charcoal/60">
                        Cada nueva cita se crea automáticamente en tu Google Calendar
                      </p>
                    </div>
                    <button
                      onClick={() => handleUpdateSetting('autoCreateEvents', !calendarStatus.autoCreateEvents)}
                      disabled={savingSettings}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:ring-offset-2 ${
                        calendarStatus.autoCreateEvents 
                          ? 'bg-luxury-gold' 
                          : 'bg-gray-200'
                      } ${savingSettings ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          calendarStatus.autoCreateEvents ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-cream/30 rounded-lg">
                    <div>
                      <h4 className="font-medium text-charcoal">Invites para clientes</h4>
                      <p className="text-sm text-charcoal/60">
                        Los clientes reciben archivo .ics para agregar a su calendario
                      </p>
                    </div>
                    <button
                      onClick={() => handleUpdateSetting('sendClientInvites', !calendarStatus.sendClientInvites)}
                      disabled={savingSettings}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:ring-offset-2 ${
                        calendarStatus.sendClientInvites 
                          ? 'bg-luxury-gold' 
                          : 'bg-gray-200'
                      } ${savingSettings ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          calendarStatus.sendClientInvites ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-cream/30 rounded-lg">
                    <div>
                      <h4 className="font-medium text-charcoal">Sincronización bidireccional</h4>
                      <p className="text-sm text-charcoal/60">
                        Eventos creados en Google Calendar se pueden importar al sistema
                      </p>
                    </div>
                    <button
                      onClick={() => handleUpdateSetting('syncBidirectional', !calendarStatus.syncBidirectional)}
                      disabled={savingSettings}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:ring-offset-2 ${
                        calendarStatus.syncBidirectional 
                          ? 'bg-luxury-gold' 
                          : 'bg-gray-200'
                      } ${savingSettings ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          calendarStatus.syncBidirectional ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sincronización Bidireccional */}
            {calendarStatus?.isConnected && calendarStatus?.syncBidirectional && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-playfair font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ArrowLeftIcon className="h-5 w-5 text-gray-600 rotate-180" />
                  Sincronización desde Google Calendar
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">¿Cómo funciona la importación?</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Busca eventos en Google Calendar que parezcan citas de manicure</li>
                      <li>• Evita duplicados verificando horarios y eventos existentes</li>
                      <li>• Extrae información del cliente del título del evento</li>
                      <li>• Asigna automáticamente el servicio más probable</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Importar eventos desde Google</h4>
                      <p className="text-sm text-gray-600">
                        Buscar eventos de los últimos 7 días y próximos 30 días
                      </p>
                    </div>
                    <button
                      onClick={handleSyncFromGoogle}
                      disabled={syncingFromGoogle}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {syncingFromGoogle ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <ArrowLeftIcon className="h-4 w-4 rotate-180" />
                          Importar Ahora
                        </>
                      )}
                    </button>
                  </div>

                  {/* Resultados de la sincronización */}
                  {syncResults && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-green-50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">{syncResults.summary.importedCount}</div>
                          <div className="text-sm text-green-800">Importadas</div>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-yellow-600">{syncResults.summary.skippedCount}</div>
                          <div className="text-sm text-yellow-800">Omitidas</div>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-red-600">{syncResults.summary.errorCount}</div>
                          <div className="text-sm text-red-800">Errores</div>
                        </div>
                      </div>

                      {syncResults.imported.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">✅ Citas Importadas:</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {syncResults.imported.map((event: any, index: number) => (
                              <div key={index} className="p-2 bg-green-50 rounded border border-green-200 text-sm">
                                <div className="font-medium text-green-900">{event.title}</div>
                                <div className="text-green-700">
                                  {new Date(event.startTime).toLocaleString('es-CO')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {syncResults.skipped.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">⚠️ Eventos Omitidos:</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {syncResults.skipped.map((event: any, index: number) => (
                              <div key={index} className="p-2 bg-yellow-50 rounded border border-yellow-200 text-sm">
                                <div className="font-medium text-yellow-900">{event.title}</div>
                                <div className="text-yellow-700">{event.reason}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {syncResults.errors.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">❌ Errores:</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {syncResults.errors.map((event: any, index: number) => (
                              <div key={index} className="p-2 bg-red-50 rounded border border-red-200 text-sm">
                                <div className="font-medium text-red-900">{event.title}</div>
                                <div className="text-red-700">{event.reason}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preview del evento */}
            {calendarStatus.isConnected && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10">
                <h3 className="text-lg font-playfair font-bold text-charcoal mb-4 flex items-center gap-2">
                  <CalendarDaysIcon className="h-5 w-5" />
                  Preview del Evento en Google Calendar
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-16 bg-luxury-gold rounded-full"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-charcoal text-lg">
                          Semi Permanente Premium - María García
                        </h4>
                        <p className="text-sm text-charcoal/60 mt-1">
                          📅 Hoy, 2:00 PM - 3:15 PM (75 min)
                        </p>
                      </div>
                    </div>
                    
                    <div className="ml-4 pl-3 space-y-2 text-sm text-charcoal/80">
                      <p><span className="font-medium">📱 Cliente:</span> María García</p>
                      <p><span className="font-medium">📞 WhatsApp:</span> +57 300 123 4567</p>
                      <p><span className="font-medium">📍 Dirección:</span> Calle 5 #123-45, Ciudad Jardín</p>
                      <p><span className="font-medium">💅 Servicio:</span> Semi Permanente Premium</p>
                      <p><span className="font-medium">📝 Notas:</span> Diseño floral en tonos rosa</p>
                      <p><span className="font-medium">🔗 Gestionar:</span> 
                        <span className="text-blue-600 ml-1">
                          {process.env.PUBLIC_BASE_URL || 'https://tudominio.com'}/admin/appointments
                        </span>
                      </p>
                    </div>
                    
                    <div className="ml-4 pl-3 pt-2 border-t border-gray-200">
                      <p className="text-xs text-charcoal/50">
                        🔔 Recordatorios: 1 hora antes y 15 minutos antes
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-charcoal/60 mt-3">
                  Así es como aparecerán las citas en tu Google Calendar con toda la información necesaria.
                </p>
              </div>
            )}

            {/* Estadísticas de sincronización */}
            {stats && calendarStatus?.isConnected && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-playfair font-bold text-gray-900 flex items-center gap-2">
                    <ChartBarIcon className="h-5 w-5 text-gray-600" />
                    Estadísticas de Sincronización
                  </h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    Últimos {stats.periodDays} días
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900 uppercase tracking-wide">Total de Citas</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalAppointments}</p>
                        <p className="text-xs text-blue-700 mt-1">En {stats.periodDays} días</p>
                      </div>
                      <div className="p-3 bg-blue-200 rounded-full">
                        <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-blue-200 rounded-full -mr-8 -mb-8 opacity-20"></div>
                  </div>
                  
                  <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-900 uppercase tracking-wide">Sincronizadas</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">{stats.appointmentsWithGoogleEvent}</p>
                        <p className="text-xs text-green-700 mt-1">Con Google Calendar</p>
                      </div>
                      <div className="p-3 bg-green-200 rounded-full">
                        <CloudIcon className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-green-200 rounded-full -mr-8 -mb-8 opacity-20"></div>
                  </div>
                  
                  <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-900 uppercase tracking-wide">Tasa de Éxito</p>
                        <p className="text-3xl font-bold text-amber-600 mt-2">{stats.syncSuccessRate}%</p>
                        <p className="text-xs text-amber-700 mt-1">Sincronización</p>
                      </div>
                      <div className="p-3 bg-amber-200 rounded-full">
                        <BoltIcon className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-amber-200 rounded-full -mr-8 -mb-8 opacity-20"></div>
                  </div>
                </div>

                {stats.recentEvents.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-gray-600" />
                      Eventos Recientes Sincronizados
                    </h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {stats.recentEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                {event.serviceName}
                              </div>
                              <div className="text-xs text-gray-600">
                                {event.clientName} • {new Date(event.startAt).toLocaleDateString('es-CO', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">
                              Sincronizado
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Vista de Calendario Visual */}
            {calendarStatus?.isConnected && (
              <CalendarView className="mb-6" />
            )}

            {/* Información sobre el sistema */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-playfair font-bold text-blue-900 mb-3">
                ¿Cómo funciona el sistema?
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-4 w-4 mt-0.5 text-blue-600" />
                  <span>Las citas se crean automáticamente en tu Google Calendar personal</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-4 w-4 mt-0.5 text-blue-600" />
                  <span>Los clientes reciben notificaciones por WhatsApp (no se requiere email)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-4 w-4 mt-0.5 text-blue-600" />
                  <span>Opcionalmente pueden descargar archivo .ics para su calendario</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-4 w-4 mt-0.5 text-blue-600" />
                  <span>Zero fricción en el proceso de reserva</span>
                </li>
              </ul>
            </div>

            {/* Instrucciones para configurar Google Calendar */}
            {!calendarStatus.isConnected && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="text-lg font-playfair font-bold text-yellow-900 mb-4">
                  📋 Guía de Configuración Paso a Paso
                </h3>
                <div className="space-y-4 text-sm text-yellow-800">
                  <div>
                    <h4 className="font-semibold mb-2">1. Google Cloud Console</h4>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li>Ve a <a href="https://console.cloud.google.com" target="_blank" className="text-blue-600 underline">console.cloud.google.com</a></li>
                      <li>Crea un nuevo proyecto o selecciona uno existente</li>
                      <li>En el menú lateral, ve a "APIs y servicios" → "Biblioteca"</li>
                      <li>Busca "Google Calendar API" y habilítala</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">2. Configurar OAuth 2.0</h4>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li>Ve a "APIs y servicios" → "Credenciales"</li>
                      <li>Click "Crear credenciales" → "ID de cliente de OAuth 2.0"</li>
                      <li>Tipo de aplicación: "Aplicación web"</li>
                      <li><strong>URI de redirección autorizada:</strong> 
                        <code className="bg-yellow-100 px-2 py-1 rounded ml-1 block mt-1">
                          http://localhost:3008/api/admin/google-calendar/callback
                        </code>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">3. Variables de entorno</h4>
                    <p>Copia el Client ID y Client Secret al archivo .env:</p>
                    <pre className="bg-yellow-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`GOOGLE_CLIENT_ID="tu_client_id_aqui"
GOOGLE_CLIENT_SECRET="tu_client_secret_aqui"`}
                    </pre>
                  </div>
                  
                  <div className="bg-yellow-100 p-3 rounded">
                    <h4 className="font-semibold mb-1">✅ Estado actual:</h4>
                    <p>Las credenciales ya están configuradas. Solo necesitas agregarlas en Google Cloud Console.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Troubleshooting */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-playfair font-bold text-gray-900 mb-4">
                🔧 Solución de Problemas
              </h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">❌ "Error de autorización"</h4>
                  <ul className="space-y-1 ml-4 list-disc text-gray-700">
                    <li>Verifica que el redirect URI esté exactamente como se muestra arriba</li>
                    <li>Asegúrate de usar el puerto 3008</li>
                    <li>Revisa que las credenciales estén correctas en .env</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">❌ "Token expirado"</h4>
                  <ul className="space-y-1 ml-4 list-disc text-gray-700">
                    <li>El sistema renueva automáticamente los tokens</li>
                    <li>Si persiste, desconecta y vuelve a conectar</li>
                    <li>Usa el botón "Probar Conexión" para verificar</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">❌ "No se crean eventos"</h4>
                  <ul className="space-y-1 ml-4 list-disc text-gray-700">
                    <li>Verifica que "Crear eventos automáticamente" esté activado</li>
                    <li>Revisa los logs del servidor en la consola</li>
                    <li>Prueba creando una cita de prueba</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-1">💡 Consejo</h4>
                  <p className="text-blue-700">
                    Usa el botón "Probar Conexión" para diagnosticar problemas de conectividad en tiempo real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-luxury-gold/10">
            <p className="text-charcoal/60">No se pudo cargar la configuración del calendario</p>
          </div>
        )}
      </main>
      
      {/* Sistema de Notificaciones */}
      <NotificationToast 
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  )
}