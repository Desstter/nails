'use client'

import { useState, useEffect } from 'react'
import { 
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'

interface Service {
  id: string
  name: string
  durationMin: number
  basePriceCOP: number
}

interface CreateAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  serviceId: string
  clientName: string
  phoneWhatsApp: string
  address: string
  neighborhood: string
  startAt: string
  priceCOP: string
  notes: string
  status: string
}

export default function CreateAppointmentModal({ isOpen, onClose, onSuccess }: CreateAppointmentModalProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    serviceId: '',
    clientName: '',
    phoneWhatsApp: '',
    address: '',
    neighborhood: '',
    startAt: '',
    priceCOP: '',
    notes: '',
    status: 'pending'
  })

  useEffect(() => {
    if (isOpen) {
      fetchServices()
      // Establecer fecha y hora por defecto (próxima hora)
      const now = new Date()
      now.setHours(now.getHours() + 1, 0, 0, 0)
      setFormData(prev => ({
        ...prev,
        startAt: now.toISOString().slice(0, 16)
      }))
    }
  }, [isOpen])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.data.services)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    setFormData(prev => ({
      ...prev,
      serviceId,
      priceCOP: service ? service.basePriceCOP.toString() : ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          priceCOP: parseInt(formData.priceCOP)
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Resetear formulario
        setFormData({
          serviceId: '',
          clientName: '',
          phoneWhatsApp: '',
          address: '',
          neighborhood: '',
          startAt: '',
          priceCOP: '',
          notes: '',
          status: 'pending'
        })
        onSuccess()
        onClose()
      } else {
        setError(data.error?.message || 'Error al crear la cita')
      }
    } catch (error) {
      setError('Error de conexión al crear la cita')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-playfair font-bold text-charcoal">
            Crear Nueva Cita
          </h2>
          <button
            onClick={onClose}
            className="text-charcoal/60 hover:text-charcoal transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Servicio */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Servicio *
            </label>
            <select
              value={formData.serviceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
              required
            >
              <option value="">Seleccionar servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.durationMin}min - ${service.basePriceCOP.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Información del Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                <UserIcon className="h-4 w-4 inline mr-1" />
                Nombre del Cliente *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                <PhoneIcon className="h-4 w-4 inline mr-1" />
                Teléfono WhatsApp *
              </label>
              <input
                type="tel"
                value={formData.phoneWhatsApp}
                onChange={(e) => handleInputChange('phoneWhatsApp', e.target.value)}
                placeholder="3123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                <MapPinIcon className="h-4 w-4 inline mr-1" />
                Dirección *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Barrio *
              </label>
              <input
                type="text"
                value={formData.neighborhood}
                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                placeholder="El Ingenio, Ciudad Jardín, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Fecha/Hora y Precio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Fecha y Hora *
              </label>
              <input
                type="datetime-local"
                value={formData.startAt}
                onChange={(e) => handleInputChange('startAt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                Precio (COP) *
              </label>
              <input
                type="number"
                value={formData.priceCOP}
                onChange={(e) => handleInputChange('priceCOP', e.target.value)}
                min="0"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Estado Inicial
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
            >
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmada</option>
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              <ChatBubbleLeftIcon className="h-4 w-4 inline mr-1" />
              Notas (Opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
              placeholder="Solicitudes especiales, comentarios, etc."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-charcoal rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-luxury-gold text-white rounded-lg hover:bg-luxury-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}