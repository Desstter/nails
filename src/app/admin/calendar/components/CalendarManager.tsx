'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  LinkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface CalendarStatus {
  isConnected: boolean
  autoCreateEvents: boolean
  sendClientInvites: boolean
  syncBidirectional: boolean
  lastConnection: string | null
}

export default function CalendarManager() {
  const { data: session, status } = useSession()
  const [calendarStatus, setCalendarStatus] = useState<CalendarStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCalendarStatus()
    }
  }, [status])

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
      const response = await fetch('/api/admin/google-calendar/connect')
      if (response.ok) {
        const data = await response.json()
        // Redirigir a Google OAuth
        window.location.href = data.data.authUrl
      } else {
        setMessage({ type: 'error', text: 'Error al generar URL de autorización' })
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error)
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
                  {calendarStatus.isConnected ? (
                    <button
                      onClick={handleDisconnect}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Desconectar
                    </button>
                  ) : (
                    <button
                      onClick={handleConnect}
                      disabled={connecting}
                      className="px-6 py-2 bg-luxury-gold text-white rounded-lg hover:bg-luxury-gold/90 transition-colors disabled:opacity-50 flex items-center gap-2"
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
                    <div className={`p-2 rounded-full ${
                      calendarStatus.autoCreateEvents 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {calendarStatus.autoCreateEvents ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <XCircleIcon className="h-5 w-5" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-cream/30 rounded-lg">
                    <div>
                      <h4 className="font-medium text-charcoal">Invites para clientes</h4>
                      <p className="text-sm text-charcoal/60">
                        Los clientes reciben archivo .ics para agregar a su calendario
                      </p>
                    </div>
                    <div className={`p-2 rounded-full ${
                      calendarStatus.sendClientInvites 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {calendarStatus.sendClientInvites ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <XCircleIcon className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
                <h3 className="text-lg font-playfair font-bold text-yellow-900 mb-3">
                  Configuración Requerida
                </h3>
                <div className="space-y-3 text-sm text-yellow-800">
                  <p>Para conectar Google Calendar necesitas:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Crear proyecto en Google Cloud Console</li>
                    <li>Habilitar Google Calendar API</li>
                    <li>Configurar OAuth 2.0 credentials</li>
                    <li>Agregar redirect URI: <code className="bg-yellow-100 px-1 rounded">http://localhost:3005/api/auth/google/callback</code></li>
                  </ol>
                  <p className="mt-3">
                    <strong>Nota:</strong> Los Client ID y Secret se configuran en las variables de entorno.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-luxury-gold/10">
            <p className="text-charcoal/60">No se pudo cargar la configuración del calendario</p>
          </div>
        )}
      </main>
    </div>
  )
}