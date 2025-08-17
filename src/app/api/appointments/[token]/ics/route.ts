import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateICSInvite } from '@/lib/google-calendar'

interface RouteParams {
  token: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { token } = await params

    // Buscar la cita por token
    const appointment = await prisma.appointment.findUnique({
      where: { bookingPublicToken: token },
      include: { service: true }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    // Generar archivo .ics
    const icsContent = generateICSInvite({
      clientName: appointment.clientName,
      phoneWhatsApp: appointment.phoneWhatsApp,
      address: appointment.address,
      neighborhood: appointment.neighborhood,
      startAt: appointment.startAt,
      endAt: appointment.endAt,
      service: appointment.service,
      notes: appointment.notes
    })

    // Nombre del archivo basado en servicio y fecha
    const fecha = appointment.startAt.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-')
    
    const filename = `Joangel-Nails-${appointment.service.name.replace(/\s+/g, '-')}-${fecha}.ics`

    // Retornar archivo .ics
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Error generating ICS file:', error)
    return NextResponse.json(
      { error: 'Error al generar archivo de calendario' },
      { status: 500 }
    )
  }
}