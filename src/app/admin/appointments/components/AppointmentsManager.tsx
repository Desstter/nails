'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

interface Appointment {
  id: string
  clientName: string
  phoneWhatsApp: string
  address: string
  neighborhood: string
  startAt: string
  endAt: string
  status: string
  priceCOP: number
  notes: string | null
  bookingPublicToken: string
  service: {
    id: string
    name: string
    durationMin: number
  }
  createdAt: string
}

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada'
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
}

export default function AppointmentsManager() {
  const { data: session, status } = useSession()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAppointments()
    }
  }, [status])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.data.appointments)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Actualizar la lista local
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === appointmentId
              ? { ...apt, status: newStatus }
              : apt
          )
        )
      } else {
        alert('Error al actualizar el estado de la cita')
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      alert('Error al actualizar la cita')
    }
  }

  // Filtrar citas
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.phoneWhatsApp.includes(searchTerm) ||
      appointment.service.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    
    const matchesDate = !selectedDate || 
      new Date(appointment.startAt).toISOString().split('T')[0] === selectedDate

    return matchesSearch && matchesStatus && matchesDate
  })

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
                  Gestión de Citas
                </h1>
                <p className="text-charcoal/60 mt-1">
                  {filteredAppointments.length} citas encontradas
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-luxury-gold/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-charcoal/40" />
              <input
                type="text"
                placeholder="Buscar por cliente, teléfono o servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
              />
            </div>

            {/* Filtro por estado */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-charcoal/40" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent appearance-none"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmadas</option>
                <option value="completed">Completadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>

            {/* Filtro por fecha */}
            <div className="relative">
              <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-charcoal/40" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Lista de citas */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
              <p className="text-charcoal">Cargando citas...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-luxury-gold/10">
              <p className="text-charcoal/60">No se encontraron citas con los filtros aplicados</p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-luxury-gold/10 hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Información del cliente */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status as keyof typeof statusColors]}`}>
                        {statusLabels[appointment.status as keyof typeof statusLabels]}
                      </span>
                    </div>
                    <h3 className="font-semibold text-charcoal text-lg">
                      {appointment.clientName}
                    </h3>
                    <div className="flex items-center gap-2 text-charcoal/60">
                      <PhoneIcon className="h-4 w-4" />
                      <a 
                        href={`https://wa.me/57${appointment.phoneWhatsApp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-luxury-gold transition-colors"
                      >
                        {appointment.phoneWhatsApp}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-charcoal/60">
                      <MapPinIcon className="h-4 w-4" />
                      <span className="text-sm">
                        {appointment.neighborhood} - {appointment.address}
                      </span>
                    </div>
                  </div>

                  {/* Información del servicio */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-charcoal">Servicio</h4>
                    <p className="text-luxury-gold font-semibold">
                      {appointment.service.name}
                    </p>
                    <p className="text-charcoal/60 text-sm">
                      Duración: {appointment.service.durationMin} min
                    </p>
                    <p className="text-charcoal font-semibold">
                      ${appointment.priceCOP.toLocaleString()} COP
                    </p>
                  </div>

                  {/* Fecha y hora */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-charcoal">Fecha y Hora</h4>
                    <p className="text-charcoal">
                      {new Date(appointment.startAt).toLocaleDateString('es-CO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-charcoal font-medium">
                      {new Date(appointment.startAt).toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {new Date(appointment.endAt).toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {appointment.notes && (
                      <p className="text-charcoal/60 text-sm italic">
                        Nota: {appointment.notes}
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-charcoal">Acciones</h4>
                    <div className="flex flex-col gap-2">
                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 transition-colors"
                        >
                          Confirmar
                        </button>
                      )}
                      
                      {['pending', 'confirmed'].includes(appointment.status) && (
                        <>
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                          >
                            Marcar Completada
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200 transition-colors"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      
                      <Link
                        href={`/reservar/${appointment.bookingPublicToken}`}
                        target="_blank"
                        className="px-3 py-1 bg-luxury-gold/10 text-luxury-gold rounded-lg text-sm hover:bg-luxury-gold/20 transition-colors text-center"
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}