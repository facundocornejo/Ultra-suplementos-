import { z } from 'zod'

// ============================================
// CONSTANTES DE VALIDACION
// ============================================

export const MAX_PRICE = 99999999 // Maximo ~100 millones
export const MAX_QUANTITY = 999999 // Maximo 1 millon de unidades
export const MAX_TEXT_SHORT = 200
export const MAX_TEXT_MEDIUM = 500
export const MAX_TEXT_LONG = 1000

// ============================================
// REGEX PATTERNS
// ============================================

// DNI argentino: 7-8 digitos, opcionalmente con puntos
export const DNI_REGEX = /^[\d]{7,8}$|^[\d]{1,2}\.[\d]{3}\.[\d]{3}$/

// CUIT/CUIL argentino: XX-XXXXXXXX-X o XXXXXXXXXXX
export const CUIT_REGEX = /^(20|23|24|27|30|33|34)[-]?[\d]{8}[-]?[\d]$/

// Telefono argentino: permite +54, 0, espacios, guiones, parentesis
export const PHONE_REGEX = /^[\d\s\-\+\(\)]{7,20}$/

// Solo letras, espacios, acentos y caracteres comunes en nombres
export const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-'\.]+$/

// Nombre de empresa: letras, numeros, espacios y caracteres comunes
export const BUSINESS_NAME_REGEX = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-'\.&,]+$/

// ============================================
// FUNCIONES DE VALIDACION
// ============================================

/**
 * Valida formato de DNI argentino
 */
export function isValidDNI(dni: string): boolean {
  if (!dni) return true // Opcional
  const cleaned = dni.replace(/\./g, '')
  return cleaned.length >= 7 && cleaned.length <= 8 && /^\d+$/.test(cleaned)
}

/**
 * Valida formato de CUIT/CUIL argentino con digito verificador
 */
export function isValidCUIT(cuit: string): boolean {
  if (!cuit) return true // Opcional

  // Limpiar guiones y espacios
  const cleaned = cuit.replace(/[-\s]/g, '')

  if (cleaned.length !== 11 || !/^\d+$/.test(cleaned)) {
    return false
  }

  // Validar prefijo
  const prefix = cleaned.substring(0, 2)
  const validPrefixes = ['20', '23', '24', '27', '30', '33', '34']
  if (!validPrefixes.includes(prefix)) {
    return false
  }

  // Validar digito verificador
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * multipliers[i]
  }
  const remainder = sum % 11
  const verifier = remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder

  return parseInt(cleaned[10]) === verifier
}

/**
 * Valida que un telefono tenga formato razonable
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return true // Opcional
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

/**
 * Sanitiza texto removiendo caracteres peligrosos
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Prevenir XSS basico
    .trim()
}

/**
 * Valida que una fecha no sea futura (para compras, etc)
 */
export function isNotFutureDate(dateStr: string): boolean {
  if (!dateStr) return true
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return date <= today
}

/**
 * Valida que una fecha sea futura (para vencimientos)
 */
export function isFutureDate(dateStr: string): boolean {
  if (!dateStr) return true
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}

// ============================================
// SCHEMAS REUTILIZABLES
// ============================================

/**
 * Schema para precios/montos monetarios
 */
export const moneySchema = z.coerce
  .number()
  .min(0, 'El monto debe ser mayor o igual a 0')
  .max(MAX_PRICE, 'El monto excede el limite permitido')
  .transform((val) => Math.round(val * 100) / 100)

/**
 * Schema para cantidades enteras
 */
export const quantitySchema = z.coerce
  .number()
  .int('Debe ser un numero entero')
  .min(0, 'No puede ser negativo')
  .max(MAX_QUANTITY, 'La cantidad excede el limite permitido')

/**
 * Schema para email opcional
 */
export const optionalEmailSchema = z
  .string()
  .transform((val) => val?.trim() || null)
  .pipe(
    z
      .string()
      .email('El email no tiene un formato valido')
      .nullable()
      .or(z.literal(''))
      .or(z.null())
  )

/**
 * Schema para telefono opcional
 */
export const optionalPhoneSchema = z
  .string()
  .max(30, 'El telefono es muy largo')
  .optional()
  .nullable()
  .transform((val) => val?.trim() || null)
  .refine((val) => isValidPhone(val || ''), {
    message: 'El telefono no tiene un formato valido',
  })

/**
 * Schema para DNI opcional
 */
export const optionalDNISchema = z
  .string()
  .max(12, 'El DNI es muy largo')
  .optional()
  .nullable()
  .transform((val) => val?.trim() || null)
  .refine((val) => isValidDNI(val || ''), {
    message: 'El DNI debe tener 7-8 digitos',
  })

/**
 * Schema para CUIT opcional
 */
export const optionalCUITSchema = z
  .string()
  .max(15, 'El CUIT es muy largo')
  .optional()
  .nullable()
  .transform((val) => val?.trim() || null)
  .refine((val) => isValidCUIT(val || ''), {
    message: 'El CUIT no tiene un formato valido (ej: 20-12345678-9)',
  })

/**
 * Schema para notas/observaciones
 */
export const notesSchema = z
  .string()
  .max(MAX_TEXT_LONG, 'Las notas son muy largas (maximo 1000 caracteres)')
  .optional()
  .nullable()
  .transform((val) => sanitizeText(val || '') || null)

/**
 * Schema para direccion
 */
export const addressSchema = z
  .string()
  .max(MAX_TEXT_MEDIUM, 'La direccion es muy larga')
  .optional()
  .nullable()
  .transform((val) => sanitizeText(val || '') || null)

/**
 * Schema para ciudad
 */
export const citySchema = z
  .string()
  .max(100, 'La ciudad es muy larga')
  .optional()
  .nullable()
  .transform((val) => sanitizeText(val || '') || null)
