import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev_encryption_key_32_chars_min'
const ALGORITHM = 'aes-256-gcm'

// Asegurar que la clave tenga 32 caracteres
const normalizeKey = (key: string): Buffer => {
  if (key.length < 32) {
    // Rellenar con ceros si es muy corta
    return Buffer.from(key.padEnd(32, '0'))
  } else if (key.length > 32) {
    // Truncar si es muy larga
    return Buffer.from(key.substring(0, 32))
  }
  return Buffer.from(key)
}

// Encriptar texto
export function encrypt(text: string): string {
  try {
    const key = normalizeKey(ENCRYPTION_KEY)
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    // Combinar IV y texto encriptado
    return iv.toString('hex') + ':' + encrypted
  } catch (error) {
    console.error('Error encrypting text:', error)
    throw new Error('Error en encriptación')
  }
}

// Desencriptar texto
export function decrypt(encryptedText: string): string {
  try {
    const key = normalizeKey(ENCRYPTION_KEY)
    const parts = encryptedText.split(':')
    
    if (parts.length !== 2) {
      throw new Error('Formato de texto encriptado inválido')
    }
    
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Error decrypting text:', error)
    throw new Error('Error en desencriptación')
  }
}

// Verificar si un texto está encriptado (simple heurística)
export function isEncrypted(text: string): boolean {
  return text.includes(':') && text.length > 32
}