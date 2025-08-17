import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { APIResponse } from '@/types/booking'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'UNAUTHORIZED',
          message: 'No tienes permisos para realizar esta acción'
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    if (!id) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'MISSING_ID',
          message: 'ID de bloqueo requerido'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Verificar que el bloqueo existe
    const existingBlock = await prisma.blockTime.findUnique({
      where: { id }
    })

    if (!existingBlock) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'BLOCK_NOT_FOUND',
          message: 'Bloqueo no encontrado'
        }
      }
      return NextResponse.json(errorResponse, { status: 404 })
    }

    // Validar campos que se pueden actualizar
    const allowedUpdates: { [key: string]: any } = {}
    
    if (body.active !== undefined) {
      allowedUpdates.active = Boolean(body.active)
    }
    
    if (body.reason !== undefined) {
      allowedUpdates.reason = body.reason?.trim() || null
    }

    // Actualizar el bloqueo
    const updatedBlock = await prisma.blockTime.update({
      where: { id },
      data: allowedUpdates
    })

    const response: APIResponse<{ block: typeof updatedBlock }> = {
      success: true,
      data: { block: updatedBlock }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error updating block:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'UPDATE_ERROR',
        message: 'Error al actualizar el bloqueo'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'UNAUTHORIZED',
          message: 'No tienes permisos para realizar esta acción'
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'MISSING_ID',
          message: 'ID de bloqueo requerido'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Verificar que el bloqueo existe
    const existingBlock = await prisma.blockTime.findUnique({
      where: { id }
    })

    if (!existingBlock) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: {
          error: 'BLOCK_NOT_FOUND',
          message: 'Bloqueo no encontrado'
        }
      }
      return NextResponse.json(errorResponse, { status: 404 })
    }

    // Eliminar el bloqueo
    await prisma.blockTime.delete({
      where: { id }
    })

    const response: APIResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Bloqueo eliminado exitosamente'
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error deleting block:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: {
        error: 'DELETE_ERROR',
        message: 'Error al eliminar el bloqueo'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}