// API para obtener servicios disponibles
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { ServicesResponse, APIResponse } from '@/types/booking'

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: {
        active: true
      },
      orderBy: {
        basePriceCOP: 'asc'
      }
    })

    const response: APIResponse<ServicesResponse> = {
      success: true,
      data: {
        services
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching services:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'FETCH_SERVICES_ERROR',
        message: 'Error al obtener los servicios disponibles'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}