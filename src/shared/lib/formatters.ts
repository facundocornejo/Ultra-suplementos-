import { format as dateFnsFormat } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatea un número como moneda argentina (ARS)
 * @param amount - Monto a formatear
 * @returns String formateado como "$1.234,56"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formatea una fecha en formato argentino
 * @param date - Fecha a formatear (Date, string o timestamp)
 * @param formatString - Formato de salida (default: 'dd/MM/yyyy')
 * @returns String formateado como "15/01/2026"
 */
export function formatDate(
  date: Date | string | number,
  formatString: string = 'dd/MM/yyyy'
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date

  return dateFnsFormat(dateObj, formatString, { locale: es })
}

/**
 * Formatea una fecha con hora
 * @param date - Fecha a formatear
 * @returns String formateado como "15/01/2026 14:30"
 */
export function formatDateTime(date: Date | string | number): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

/**
 * Formatea un CUIT en formato argentino
 * @param cuit - CUIT sin formato (ej: "20374659449")
 * @returns String formateado como "20-37465944-9"
 */
export function formatCUIT(cuit: string): string {
  if (!cuit || cuit.length !== 11) return cuit

  return `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}`
}

/**
 * Formatea un número de teléfono argentino
 * @param phone - Teléfono sin formato
 * @returns String formateado
 */
export function formatPhone(phone: string): string {
  if (!phone) return phone

  // Eliminar todo excepto números
  const cleaned = phone.replace(/\D/g, '')

  // Formato: (343) 523-6666
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  return phone
}

/**
 * Formatea un porcentaje
 * @param value - Valor decimal (ej: 0.15 para 15%)
 * @param decimals - Decimales a mostrar (default: 0)
 * @returns String formateado como "15%"
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Formatea un número con separadores de miles
 * @param value - Número a formatear
 * @returns String formateado como "1.234"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-AR').format(value)
}

/**
 * Acorta un texto si es más largo que el límite
 * @param text - Texto a acortar
 * @param maxLength - Longitud máxima
 * @returns Texto acortado con "..." si es necesario
 */
export function truncate(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Formatea bytes a tamaño legible
 * @param bytes - Tamaño en bytes
 * @returns String formateado como "1.5 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Obtiene las iniciales de un nombre
 * @param name - Nombre completo
 * @returns Iniciales (máximo 2 letras)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Formatea tiempo relativo (ej: "hace 2 horas")
 * @param date - Fecha a formatear
 * @returns String con tiempo relativo
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date

  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`
  if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`

  return formatDate(dateObj)
}
