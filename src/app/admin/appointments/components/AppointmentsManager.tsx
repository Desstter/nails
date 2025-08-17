'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import CreateAppointmentModal from './CreateAppointmentModal'
import EditAppointmentModal from './EditAppointmentModal'
import Toast from './Toast'
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  PhoneIcon,
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon
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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [totalAppointments, setTotalAppointments] = useState(0)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAppointments()
    }
  }, [status, currentPage, statusFilter, selectedDate])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString()
      })
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      if (selectedDate) {
        params.append('date', selectedDate)
      }

      const response = await fetch(`/api/admin/appointments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.data.appointments)
        setTotalAppointments(data.data.total)
      } else {
        setToast({ type: 'error', message: 'Error al cargar las citas' })
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setToast({ type: 'error', message: 'Error de conexión al cargar las citas' })
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
        setToast({ type: 'success', message: 'Estado de cita actualizado exitosamente' })
      } else {
        setToast({ type: 'error', message: 'Error al actualizar el estado de la cita' })
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      setToast({ type: 'error', message: 'Error de conexión al actualizar la cita' })
    }
  }

  const deleteAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remover de la lista local
        setAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
        setShowDeleteConfirm(null)
        setToast({ type: 'success', message: 'Cita eliminada exitosamente' })
      } else {
        setToast({ type: 'error', message: 'Error al eliminar la cita' })
      }
    } catch (error) {
      console.error('Error deleting appointment:', error)
      setToast({ type: 'error', message: 'Error de conexión al eliminar la cita' })
    }
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setShowEditModal(true)
  }

  const handleModalSuccess = () => {
    fetchAppointments() // Recargar lista después de crear/editar
    setToast({ type: 'success', message: 'Operación completada exitosamente' })
  }

  // Filtrar citas solo por búsqueda (el resto se maneja en el backend)
  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      appointment.clientName.toLowerCase().includes(searchLower) ||
      appointment.phoneWhatsApp.includes(searchTerm) ||
      appointment.service.name.toLowerCase().includes(searchLower)
    )
  })

  const totalPages = Math.ceil(totalAppointments / itemsPerPage)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleFilterChange = (filterType: 'status' | 'date', value: string) => {
    setCurrentPage(1) // Reset to first page when filtering
    if (filterType === 'status') {
      setStatusFilter(value)
    } else {
      setSelectedDate(value)
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

  console.log('AppointmentsManager render - status:', status, 'showCreateModal:', showCreateModal)

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
            <button
              onClick={() => {
                console.log('Botón Nueva Cita clickeado!')
                setShowCreateModal(true)
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 border-2 border-black"
              style={{ backgroundColor: 'red', color: 'white', padding: '10px', fontSize: '16px' }}
            >
              <PlusIcon className="h-5 w-5" />
              ⭐ NUEVA CITA ⭐
            </button>
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
                onChange={(e) => handleFilterChange('status', e.target.value)}
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
                onChange={(e) => handleFilterChange('date', e.target.value)}
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
                      {/* Botones principales de edición */}
                      <button
                        onClick={() => handleEditAppointment(appointment)}
                        className="px-3 py-1 bg-luxury-gold/10 text-luxury-gold rounded-lg text-sm hover:bg-luxury-gold/20 transition-colors flex items-center gap-1"
                      >
                        <PencilIcon className="h-3 w-3" />
                        Editar
                      </button>
                      
                      {/* Cambio de estado rápido */}
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
                        className="px-3 py-1 bg-gray-100 text-charcoal rounded-lg text-sm hover:bg-gray-200 transition-colors text-center"
                      >
                        Ver Detalles
                      </Link>
                      
                      {/* Botón de eliminar */}
                      <button
                        onClick={() => setShowDeleteConfirm(appointment.id)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors flex items-center gap-1"
                      >
                        <TrashIcon className="h-3 w-3" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm p-4 border border-luxury-gold/10 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-charcoal/60">
                Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalAppointments)} - {Math.min(currentPage * itemsPerPage, totalAppointments)} de {totalAppointments} citas
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-charcoal/60 hover:text-luxury-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    if (pageNum > totalPages) return null
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          pageNum === currentPage
                            ? 'bg-luxury-gold text-white'
                            : 'text-charcoal/60 hover:bg-luxury-gold/10'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-charcoal/60 hover:text-luxury-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modales */}
      <CreateAppointmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleModalSuccess}
      />

      <EditAppointmentModal
        isOpen={showEditModal}
        appointment={editingAppointment}
        onClose={() => {
          setShowEditModal(false)
          setEditingAppointment(null)
        }}
        onSuccess={handleModalSuccess}
      />

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-playfair font-bold text-charcoal mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-charcoal/80 mb-6">
              ¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-charcoal rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteAppointment(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}