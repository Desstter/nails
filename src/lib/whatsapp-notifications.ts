import twilio from 'twilio'

// Configuración de Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_WHATSAPP_FROM
const businessWhatsApp = process.env.BUSINESS_WHATSAPP

// Cliente de Twilio (se inicializa solo si hay credenciales)
let twilioClient: twilio.Twilio | null = null

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken)
}

// Formatear número de WhatsApp
function formatWhatsAppNumber(phoneNumber: string): string {
  // Remover caracteres no numéricos
  const cleanNumber = phoneNumber.replace(/\D/g, '')
  
  // Si empieza con 57 (Colombia), agregamos +
  if (cleanNumber.startsWith('57')) {
    return `whatsapp:+${cleanNumber}`
  }
  
  // Si empieza con 3 (celular Colombia), agregamos +57
  if (cleanNumber.startsWith('3') && cleanNumber.length === 10) {
    return `whatsapp:+57${cleanNumber}`
  }
  
  // Si no tiene código de país, asumimos Colombia
  if (cleanNumber.length === 10) {
    return `whatsapp:+57${cleanNumber}`
  }
  
  // Si ya tiene código de país completo
  return `whatsapp:+${cleanNumber}`
}

// Generar mensaje de confirmación de cita
export function generateConfirmationMessage(appointment: {
  clientName: string
  service: { name: string }
  startAt: Date
  address: string
  neighborhood: string
  priceCOP: number
  bookingPublicToken: string
}): string {
  const fecha = appointment.startAt.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota'
  })
  
  const hora = appointment.startAt.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota'
  })

  return `¡Hola ${appointment.clientName}! 💅✨

¡Tu cita con Joangel Nails Studio está CONFIRMADA!

📅 *${appointment.service.name}*
🗓️ ${fecha}
⏰ ${hora}
📍 ${appointment.address}, ${appointment.neighborhood}
💰 $${appointment.priceCOP.toLocaleString()} COP (pago al finalizar)

🔗 Gestionar tu cita: ${process.env.PUBLIC_BASE_URL}/reservar/${appointment.bookingPublicToken}

📲 ¿Dudas? Contáctame al ${businessWhatsApp}

¡Te esperamos para consentir tus uñas! 💖`
}

// Generar mensaje de recordatorio 24h antes
export function generate24HourReminderMessage(appointment: {
  clientName: string
  service: { name: string }
  startAt: Date
  address: string
  neighborhood: string
  bookingPublicToken: string
}): string {
  const hora = appointment.startAt.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota'
  })

  return `¡Hola ${appointment.clientName}! 👋

⏰ *RECORDATORIO:* Mañana tienes tu cita de ${appointment.service.name}

🕐 Hora: ${hora}
📍 Dirección: ${appointment.address}, ${appointment.neighborhood}

🔗 Descargar calendario: ${process.env.PUBLIC_BASE_URL}/api/appointments/${appointment.bookingPublicToken}/ics

📲 ¿Necesitas cancelar o reprogramar? ${process.env.PUBLIC_BASE_URL}/reservar/${appointment.bookingPublicToken}

¡Nos vemos mañana! 💅✨`
}

// Generar mensaje de recordatorio 1h antes
export function generate1HourReminderMessage(appointment: {
  clientName: string
  service: { name: string }
  address: string
  neighborhood: string
}): string {
  return `¡Hola ${appointment.clientName}! 💖

⏰ *RECORDATORIO IMPORTANTE:* Tu cita de ${appointment.service.name} es en 1 HORA

📍 Te espero en: ${appointment.address}, ${appointment.neighborhood}

💡 *Tips para tu cita:*
• Ten las uñas limpias y sin esmalte
• Asegúrate de tener buena iluminación en casa
• Prepara un espacio cómodo para trabajar

📞 Cualquier imprevisto, llámame al ${businessWhatsApp}

¡Ya casi nos vemos! 🤩💅`
}

// Enviar notificación por WhatsApp
export async function sendWhatsAppNotification(
  toPhoneNumber: string,
  message: string
): Promise<boolean> {
  if (!twilioClient) {
    console.log('📱 WhatsApp simulado (sin credenciales Twilio):')
    console.log(`Para: ${toPhoneNumber}`)
    console.log(`Mensaje: ${message}`)
    console.log('---')
    return true // Simulamos éxito en desarrollo
  }

  try {
    const formattedNumber = formatWhatsAppNumber(toPhoneNumber)
    
    const messageResponse = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: formattedNumber
    })

    console.log(`✅ WhatsApp enviado: ${messageResponse.sid}`)
    return true
  } catch (error) {
    console.error('❌ Error enviando WhatsApp:', error)
    return false
  }
}

// Enviar confirmación de cita
export async function sendAppointmentConfirmation(appointment: {
  clientName: string
  phoneWhatsApp: string
  service: { name: string }
  startAt: Date
  address: string
  neighborhood: string
  priceCOP: number
  bookingPublicToken: string
}): Promise<boolean> {
  const message = generateConfirmationMessage(appointment)
  return await sendWhatsAppNotification(appointment.phoneWhatsApp, message)
}

// Enviar recordatorio 24 horas antes
export async function send24HourReminder(appointment: {
  clientName: string
  phoneWhatsApp: string
  service: { name: string }
  startAt: Date
  address: string
  neighborhood: string
  bookingPublicToken: string
}): Promise<boolean> {
  const message = generate24HourReminderMessage(appointment)
  return await sendWhatsAppNotification(appointment.phoneWhatsApp, message)
}

// Enviar recordatorio 1 hora antes
export async function send1HourReminder(appointment: {
  clientName: string
  phoneWhatsApp: string
  service: { name: string }
  address: string
  neighborhood: string
}): Promise<boolean> {
  const message = generate1HourReminderMessage(appointment)
  return await sendWhatsAppNotification(appointment.phoneWhatsApp, message)
}

// Verificar si las credenciales de Twilio están configuradas
export function isWhatsAppConfigured(): boolean {
  return !!(accountSid && authToken && fromNumber)
}

// Obtener información de configuración para el admin
export function getWhatsAppConfig() {
  return {
    isConfigured: isWhatsAppConfigured(),
    fromNumber: fromNumber || 'No configurado',
    businessNumber: businessWhatsApp || 'No configurado'
  }
}