import { Metadata } from 'next'
import ReportsManager from './components/ReportsManager'

export const metadata: Metadata = {
  title: 'Reportes - Admin Panel',
  description: 'Análisis de ingresos y estadísticas del negocio',
  robots: 'noindex, nofollow',
}

export default function ReportsPage() {
  return <ReportsManager />
}