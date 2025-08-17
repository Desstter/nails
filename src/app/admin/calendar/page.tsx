import { Suspense } from 'react'
import CalendarManager from './components/CalendarManager'

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
          <p className="text-charcoal">Cargando configuración...</p>
        </div>
      </div>
    }>
      <CalendarManager />
    </Suspense>
  )
}