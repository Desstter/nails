import { Metadata } from 'next'
import AdminDashboard from './components/AdminDashboard'

export const metadata: Metadata = {
  title: 'Dashboard Admin - Joangel Nails Studio',
  description: 'Panel administrativo para gestión de citas y reservas',
  robots: 'noindex, nofollow',
}

export default function AdminPage() {
  return <AdminDashboard />
}