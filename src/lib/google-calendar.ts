import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from './prisma'
import { encrypt, decrypt } from './encryption'

// Configuración OAuth2 para Google Calendar
export function getOAuth2Client(): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

// Obtener URL de autorización para conectar Google Calendar
export function getAuthUrl(): string {
  const oauth2Client = getOAuth2Client()
  
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly'
  ]

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent' // Fuerza a mostrar pantalla de consentimiento
  })
}

// Intercambiar código de autorización por tokens
export async function exchangeCodeForTokens(code: string, userId: string) {
  const oauth2Client = getOAuth2Client()
  
  try {
    const { tokens } = await oauth2Client.getAccessToken(code)
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('No se obtuvieron todos los tokens necesarios')
    }

    // Encriptar tokens antes de guardar
    const encryptedAccessToken = encrypt(tokens.access_token)
    const encryptedRefreshToken = encrypt(tokens.refresh_token)
    
    // Guardar configuración en base de datos
    const config = await prisma.googleCalendarConfig.upsert({
      where: { userId },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        isConnected: true
      },
      create: {
        userId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        isConnected: true
      }
    })

    return config
  } catch (error) {
    console.error('Error exchanging code for tokens:', error)
    throw error
  }
}

// Obtener cliente autenticado para un usuario
export async function getAuthenticatedClient(userId: string): Promise<OAuth2Client | null> {
  try {
    const config = await prisma.googleCalendarConfig.findUnique({
      where: { userId }
    })

    if (!config || !config.isConnected || !config.accessToken || !config.refreshToken) {
      return null
    }

    const oauth2Client = getOAuth2Client()
    
    // Desencriptar tokens
    const accessToken = decrypt(config.accessToken)
    const refreshToken = decrypt(config.refreshToken)

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: config.tokenExpiry?.getTime()
    })

    // Verificar si el token necesita renovación
    if (config.tokenExpiry && config.tokenExpiry < new Date()) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken()
        
        if (credentials.access_token) {
          // Actualizar token en base de datos
          await prisma.googleCalendarConfig.update({
            where: { userId },
            data: {
              accessToken: encrypt(credentials.access_token),
              tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null
            }
          })
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError)
        // Marcar como desconectado si falla el refresh
        await prisma.googleCalendarConfig.update({
          where: { userId },
          data: { isConnected: false }
        })
        return null
      }
    }

    return oauth2Client
  } catch (error) {
    console.error('Error getting authenticated client:', error)
    return null
  }
}

// Crear evento en Google Calendar
export async function createCalendarEvent(
  userId: string,
  appointment: {
    id: string
    clientName: string
    phoneWhatsApp: string
    address: string
    neighborhood: string
    startAt: Date
    endAt: Date
    service: { name: string }
    notes?: string | null
  }
) {
  try {
    const oauth2Client = await getAuthenticatedClient(userId)
    if (!oauth2Client) {
      throw new Error('Usuario no conectado a Google Calendar')
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    const event = {
      summary: `${appointment.service.name} - ${appointment.clientName}`,
      description: `
📱 Cliente: ${appointment.clientName}
📞 WhatsApp: ${appointment.phoneWhatsApp}
📍 Dirección: ${appointment.address}, ${appointment.neighborhood}
💅 Servicio: ${appointment.service.name}
${appointment.notes ? `📝 Notas: ${appointment.notes}` : ''}

🔗 Gestionar cita: ${process.env.PUBLIC_BASE_URL}/admin/appointments
      `.trim(),
      start: {
        dateTime: appointment.startAt.toISOString(),
        timeZone: 'America/Bogota'
      },
      end: {
        dateTime: appointment.endAt.toISOString(),
        timeZone: 'America/Bogota'
      },
      location: `${appointment.address}, ${appointment.neighborhood}, Cali, Colombia`,
      attendees: [
        {
          email: 'claudia@joangelnails.com', // Email del admin (cambiar por el real)
          responseStatus: 'accepted'
        }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },  // 1 hora antes
          { method: 'popup', minutes: 15 }   // 15 minutos antes
        ]
      }
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event
    })

    if (response.data.id) {
      // Actualizar appointment con Google Event ID
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { googleEventId: response.data.id }
      })
    }

    return response.data
  } catch (error) {
    console.error('Error creating calendar event:', error)
    throw error
  }
}

// Crear invite para cliente (archivo .ics)
export function generateICSInvite(appointment: {
  clientName: string
  phoneWhatsApp: string
  address: string
  neighborhood: string
  startAt: Date
  endAt: Date
  service: { name: string }
  notes?: string | null
}): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  const startDate = formatDate(appointment.startAt)
  const endDate = formatDate(appointment.endAt)
  const now = formatDate(new Date())

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Joangel Nails Studio//Booking System//ES
BEGIN:VEVENT
UID:${appointment.startAt.getTime()}@joangelnails.com
DTSTAMP:${now}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${appointment.service.name} - Joangel Nails Studio
DESCRIPTION:¡Hola ${appointment.clientName}!\\n\\nTu cita de ${appointment.service.name} está confirmada.\\n\\n📍 Dirección: ${appointment.address}, ${appointment.neighborhood}\\n📞 WhatsApp: +57 318 722 9548\\n\\n${appointment.notes ? `Notas: ${appointment.notes}\\n\\n` : ''}¡Te esperamos!
LOCATION:${appointment.address}, ${appointment.neighborhood}, Cali, Colombia
ORGANIZER;CN=Joangel Nails Studio:mailto:info@joangelnails.com
ATTENDEE;CN=${appointment.clientName}:mailto:cliente@example.com
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT1H
DESCRIPTION:Recordatorio: Cita de manicure en 1 hora
ACTION:DISPLAY
END:VALARM
BEGIN:VALARM
TRIGGER:-PT15M
DESCRIPTION:Recordatorio: Cita de manicure en 15 minutos
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`

  return ics
}

// Actualizar evento en Google Calendar
export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  appointment: {
    clientName: string
    phoneWhatsApp: string
    address: string
    neighborhood: string
    startAt: Date
    endAt: Date
    service: { name: string }
    notes?: string | null
  }
) {
  try {
    const oauth2Client = await getAuthenticatedClient(userId)
    if (!oauth2Client) {
      throw new Error('Usuario no conectado a Google Calendar')
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    const event = {
      summary: `${appointment.service.name} - ${appointment.clientName}`,
      description: `
📱 Cliente: ${appointment.clientName}
📞 WhatsApp: ${appointment.phoneWhatsApp}
📍 Dirección: ${appointment.address}, ${appointment.neighborhood}
💅 Servicio: ${appointment.service.name}
${appointment.notes ? `📝 Notas: ${appointment.notes}` : ''}

🔗 Gestionar cita: ${process.env.PUBLIC_BASE_URL}/admin/appointments
      `.trim(),
      start: {
        dateTime: appointment.startAt.toISOString(),
        timeZone: 'America/Bogota'
      },
      end: {
        dateTime: appointment.endAt.toISOString(),
        timeZone: 'America/Bogota'
      },
      location: `${appointment.address}, ${appointment.neighborhood}, Cali, Colombia`
    }

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: event
    })

    return response.data
  } catch (error) {
    console.error('Error updating calendar event:', error)
    throw error
  }
}

// Eliminar evento de Google Calendar
export async function deleteCalendarEvent(userId: string, eventId: string) {
  try {
    const oauth2Client = await getAuthenticatedClient(userId)
    if (!oauth2Client) {
      throw new Error('Usuario no conectado a Google Calendar')
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId
    })

    return true
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    throw error
  }
}

// Obtener configuración de calendario de un usuario
export async function getCalendarConfig(userId: string) {
  try {
    return await prisma.googleCalendarConfig.findUnique({
      where: { userId }
    })
  } catch (error) {
    console.error('Error in getCalendarConfig:', error)
    return null
  }
}

// Desconectar Google Calendar
export async function disconnectGoogleCalendar(userId: string) {
  await prisma.googleCalendarConfig.update({
    where: { userId },
    data: {
      isConnected: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null
    }
  })
}