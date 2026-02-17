import { z } from 'zod'
import {
  optionalEmailSchema,
  optionalPhoneSchema,
  optionalDNISchema,
  addressSchema,
  citySchema,
  notesSchema,
  sanitizeText,
  NAME_REGEX,
  MAX_TEXT_SHORT,
} from '@/shared/lib/validations'

export const customerSchema = z.object({
  full_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(MAX_TEXT_SHORT, 'El nombre es muy largo (maximo 200 caracteres)')
    .transform((val) => sanitizeText(val))
    .refine((val) => val.length >= 2, {
      message: 'El nombre debe tener al menos 2 caracteres',
    })
    .refine((val) => NAME_REGEX.test(val), {
      message: 'El nombre solo puede contener letras, espacios y guiones',
    }),

  email: optionalEmailSchema,

  phone: optionalPhoneSchema,

  dni: optionalDNISchema,

  address: addressSchema,

  city: citySchema,

  notes: notesSchema,
})

export type CustomerFormData = z.infer<typeof customerSchema>

export const customerSearchSchema = z.object({
  search: z
    .string()
    .max(100, 'Busqueda muy larga')
    .optional()
    .transform((val) => sanitizeText(val || '')),
  page: z.coerce.number().min(1).max(10000).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export type CustomerSearchParams = z.infer<typeof customerSearchSchema>
