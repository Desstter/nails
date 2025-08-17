'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  TrendingUpIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface ReportData {
  totalRevenue: number
  totalAppointments: number
  avgAppointmentValue: number
  completionRate: number
  cancellationRate: number
  serviceBreakdown: Array<{
    serviceName: string
    count: number
    revenue: number
  }>
  monthlyRevenue: Array<{
    month: string
    revenue: number
    appointments: number
  }>
  utmAnalytics: Array<{
    source: string
    medium: string
    appointments: number
    revenue: number
  }>
}

export default function ReportsManager() {
  const { data: session, status } = useSession()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (status === 'authenticated') {
      fetchReports()
    }
  }, [status, dateRange])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      
      const response = await fetch(`/api/admin/reports?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data.data)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
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
                  Reportes y Análisis
                </h1>
                <p className="text-charcoal/60 mt-1">
                  Análisis de ingresos y estadísticas del negocio
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros de fecha */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-luxury-gold/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
              />
            </div>
            <div>
              <button
                onClick={fetchReports}
                className="w-full bg-luxury-gold text-white px-4 py-2 rounded-lg hover:bg-luxury-gold/90 transition-colors"
              >
                Actualizar Reporte
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
            <p className="text-charcoal">Generando reportes...</p>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-charcoal/60">Ingresos Totales</p>
                    <p className="text-3xl font-bold text-luxury-gold">
                      ${reportData.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <CurrencyDollarIcon className="h-10 w-10 text-luxury-gold" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-charcoal/60">Total Citas</p>
                    <p className="text-3xl font-bold text-charcoal">
                      {reportData.totalAppointments}
                    </p>
                  </div>
                  <CalendarDaysIcon className="h-10 w-10 text-luxury-gold" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-charcoal/60">Valor Promedio</p>
                    <p className="text-3xl font-bold text-charcoal">
                      ${Math.round(reportData.avgAppointmentValue).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUpIcon className="h-10 w-10 text-luxury-gold" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-charcoal/60">Tasa de Completado</p>
                    <p className="text-3xl font-bold text-green-600">
                      {reportData.completionRate.toFixed(1)}%
                    </p>
                  </div>
                  <ChartBarIcon className="h-10 w-10 text-green-600" />
                </div>
              </div>
            </div>

            {/* Breakdown por servicios */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10">
              <h2 className="text-xl font-playfair font-bold text-charcoal mb-4">
                Servicios Más Solicitados
              </h2>
              <div className="space-y-3">
                {reportData.serviceBreakdown.map((service, index) => {
                  const percentage = reportData.totalAppointments > 0 
                    ? (service.count / reportData.totalAppointments) * 100 
                    : 0
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-cream/30 rounded-lg">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-medium text-charcoal">{service.serviceName}</h3>
                          <span className="text-sm text-charcoal/60">
                            {service.count} citas ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-luxury-gold h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-semibold text-luxury-gold">
                          ${service.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Análisis UTM */}
            {reportData.utmAnalytics.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10">
                <h2 className="text-xl font-playfair font-bold text-charcoal mb-4">
                  Análisis de Campañas (UTM)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-charcoal/70">Fuente</th>
                        <th className="text-left py-2 text-charcoal/70">Medio</th>
                        <th className="text-center py-2 text-charcoal/70">Citas</th>
                        <th className="text-right py-2 text-charcoal/70">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.utmAnalytics.map((utm, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 font-medium text-charcoal">
                            {utm.source || 'Directo'}
                          </td>
                          <td className="py-3 text-charcoal/70">
                            {utm.medium || '-'}
                          </td>
                          <td className="py-3 text-center text-charcoal">
                            {utm.appointments}
                          </td>
                          <td className="py-3 text-right font-semibold text-luxury-gold">
                            ${utm.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tendencia mensual */}
            {reportData.monthlyRevenue.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10">
                <h2 className="text-xl font-playfair font-bold text-charcoal mb-4">
                  Tendencia Mensual
                </h2>
                <div className="space-y-3">
                  {reportData.monthlyRevenue.map((month, index) => {
                    const maxRevenue = Math.max(...reportData.monthlyRevenue.map(m => m.revenue))
                    const percentage = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-cream/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="font-medium text-charcoal">{month.month}</h3>
                            <span className="text-sm text-charcoal/60">
                              {month.appointments} citas
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-luxury-gold h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="font-semibold text-luxury-gold">
                            ${month.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-luxury-gold/10">
            <p className="text-charcoal/60">No se pudieron cargar los reportes</p>
          </div>
        )}
      </main>
    </div>
  )
}