import { Metadata } from 'next'
import AppointmentsManager from './components/AppointmentsManager'

export const metadata: Metadata = {
  title: 'Gestión de Citas - Admin Panel',
  description: 'Gestionar todas las citas y reservas',
  robots: 'noindex, nofollow',
}

export default function AppointmentsPage() {
  return <AppointmentsManager />
}