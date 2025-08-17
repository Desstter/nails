'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CalendarDaysIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  LinkIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  todayAppointments: number
  thisWeekAppointments: number
  thisMonthRevenue: number
  pendingAppointments: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    thisWeekAppointments: 0,
    thisMonthRevenue: 0,
    pendingAppointments: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data.data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status])

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
          <Link 
            href="/admin/login"
            className="bg-luxury-gold text-white px-6 py-2 rounded-lg hover:bg-luxury-gold/90"
          >
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
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-playfair font-bold text-charcoal">
                Dashboard Administrativo
              </h1>
              <p className="text-charcoal/60 mt-1">
                Bienvenida, {session?.user?.name}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center gap-2 text-charcoal/60 hover:text-luxury-gold transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal/60">Citas Hoy</p>
                <p className="text-3xl font-bold text-charcoal">
                  {loading ? '-' : stats.todayAppointments}
                </p>
              </div>
              <CalendarDaysIcon className="h-10 w-10 text-luxury-gold" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal/60">Esta Semana</p>
                <p className="text-3xl font-bold text-charcoal">
                  {loading ? '-' : stats.thisWeekAppointments}
                </p>
              </div>
              <UserGroupIcon className="h-10 w-10 text-luxury-gold" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal/60">Ingresos del Mes</p>
                <p className="text-3xl font-bold text-charcoal">
                  {loading ? '-' : `$${stats.thisMonthRevenue.toLocaleString()}`}
                </p>
              </div>
              <CurrencyDollarIcon className="h-10 w-10 text-luxury-gold" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal/60">Pendientes</p>
                <p className="text-3xl font-bold text-charcoal">
                  {loading ? '-' : stats.pendingAppointments}
                </p>
              </div>
              <ClockIcon className="h-10 w-10 text-luxury-gold" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/admin/appointments"
            className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-charcoal">Gestionar Citas</h3>
              <CalendarDaysIcon className="h-6 w-6 text-luxury-gold group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-charcoal/60 text-sm">
              Ver, editar y gestionar todas las citas programadas
            </p>
          </Link>

          <Link
            href="/admin/blocks"
            className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-charcoal">Bloquear Tiempos</h3>
              <ClockIcon className="h-6 w-6 text-luxury-gold group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-charcoal/60 text-sm">
              Bloquear períodos para vacaciones o eventos especiales
            </p>
          </Link>

          <Link
            href="/admin/reports"
            className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-charcoal">Reportes</h3>
              <CurrencyDollarIcon className="h-6 w-6 text-luxury-gold group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-charcoal/60 text-sm">
              Análisis de ingresos y estadísticas del negocio
            </p>
          </Link>

          <Link
            href="/admin/calendar"
            className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-charcoal">Google Calendar</h3>
              <LinkIcon className="h-6 w-6 text-luxury-gold group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-charcoal/60 text-sm">
              Sincronizar citas con tu Google Calendar personal
            </p>
          </Link>
        </div>

        {/* Botón para ver el sitio */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 text-luxury-gold hover:text-luxury-gold/80 transition-colors"
          >
            Ver sitio web →
          </Link>
        </div>
      </main>
    </div>
  )
}