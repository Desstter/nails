import { Metadata } from 'next'
import BlocksManager from './components/BlocksManager'

export const metadata: Metadata = {
  title: 'Gestión de Bloques - Admin Panel',
  description: 'Gestionar bloqueos de tiempo y disponibilidad',
  robots: 'noindex, nofollow',
}

export default function BlocksPage() {
  return <BlocksManager />
}