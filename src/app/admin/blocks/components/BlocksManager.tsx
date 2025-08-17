'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  PlusIcon,
  CalendarDaysIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface BlockTime {
  id: string
  startAt: string
  endAt: string
  reason: string | null
  active: boolean
  createdAt: string
}

export default function BlocksManager() {
  const { data: session, status } = useSession()
  const [blocks, setBlocks] = useState<BlockTime[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '17:00',
    reason: ''
  })

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBlocks()
    }
  }, [status])

  const fetchBlocks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/blocks')
      if (response.ok) {
        const data = await response.json()
        setBlocks(data.data.blocks)
      }
    } catch (error) {
      console.error('Error fetching blocks:', error)
    } finally {
      setLoading(false)
    }
  }

  const createBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const startAt = new Date(`${formData.startDate}T${formData.startTime}:00`)
      const endAt = new Date(`${formData.endDate}T${formData.endTime}:00`)

      if (endAt <= startAt) {
        alert('La fecha de fin debe ser posterior a la fecha de inicio')
        return
      }

      const response = await fetch('/api/admin/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          reason: formData.reason.trim() || null
        }),
      })

      if (response.ok) {
        setShowCreateForm(false)
        setFormData({
          startDate: '',
          startTime: '09:00',
          endDate: '',
          endTime: '17:00',
          reason: ''
        })
        fetchBlocks()
      } else {
        const errorData = await response.json()
        alert(errorData.error?.message || 'Error al crear el bloqueo')
      }
    } catch (error) {
      console.error('Error creating block:', error)
      alert('Error al crear el bloqueo')
    }
  }

  const deleteBlock = async (blockId: string) => {
    if (!confirm('¿Estás segura de que quieres eliminar este bloqueo?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/blocks/${blockId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setBlocks(prev => prev.filter(block => block.id !== blockId))
      } else {
        alert('Error al eliminar el bloqueo')
      }
    } catch (error) {
      console.error('Error deleting block:', error)
      alert('Error al eliminar el bloqueo')
    }
  }

  const toggleBlockStatus = async (blockId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/blocks/${blockId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentStatus }),
      })

      if (response.ok) {
        setBlocks(prev =>
          prev.map(block =>
            block.id === blockId
              ? { ...block, active: !currentStatus }
              : block
          )
        )
      } else {
        alert('Error al actualizar el bloqueo')
      }
    } catch (error) {
      console.error('Error updating block:', error)
      alert('Error al actualizar el bloqueo')
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
                  Gestión de Bloques de Tiempo
                </h1>
                <p className="text-charcoal/60 mt-1">
                  Bloquear períodos para vacaciones, feriados o eventos especiales
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-luxury-gold text-white px-4 py-2 rounded-lg hover:bg-luxury-gold/90 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Nuevo Bloqueo
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulario de creación */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-playfair font-bold text-charcoal">
                  Crear Nuevo Bloqueo
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-charcoal/60 hover:text-charcoal"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={createBlock} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Hora de Inicio
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Fecha de Fin
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Hora de Fin
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Motivo (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Ej: Vacaciones, Feriado, Evento especial"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-charcoal rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-luxury-gold text-white rounded-lg hover:bg-luxury-gold/90 transition-colors"
                  >
                    Crear Bloqueo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de bloqueos */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
              <p className="text-charcoal">Cargando bloqueos...</p>
            </div>
          ) : blocks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-luxury-gold/10">
              <ClockIcon className="h-12 w-12 text-charcoal/30 mx-auto mb-4" />
              <p className="text-charcoal/60 text-lg mb-2">No hay bloqueos configurados</p>
              <p className="text-charcoal/40 text-sm">
                Crea un bloqueo para evitar citas en fechas específicas
              </p>
            </div>
          ) : (
            blocks.map((block) => (
              <div
                key={block.id}
                className={`bg-white rounded-xl shadow-sm p-6 border transition-all ${
                  block.active 
                    ? 'border-luxury-gold/10 hover:shadow-md' 
                    : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        block.active ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <h3 className="font-semibold text-charcoal">
                        {block.reason || 'Bloqueo sin descripción'}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-charcoal/70">
                      <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span>
                          Desde: {new Date(block.startAt).toLocaleDateString('es-CO', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4" />
                        <span>
                          {new Date(block.startAt).toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span>
                          Hasta: {new Date(block.endAt).toLocaleDateString('es-CO', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4" />
                        <span>
                          {new Date(block.endAt).toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleBlockStatus(block.id, block.active)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        block.active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {block.active ? 'Activo' : 'Inactivo'}
                    </button>
                    
                    <button
                      onClick={() => deleteBlock(block.id)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      Eliminar
                    </button>
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