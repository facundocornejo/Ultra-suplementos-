import { z } from 'zod'
import {
  sanitizeText,
  NAME_REGEX,
  MAX_TEXT_SHORT,
  MAX_TEXT_MEDIUM,
  MAX_TEXT_LONG,
} from '@/shared/lib/validations'

export const supplierSchema = z.object({
  business_name: z
    .string()
    .min(2, 'La razon social debe tener al menos 2 caracteres')
    .max(MAX_TEXT_SHORT, 'La razon social es muy larga (maximo 200 caracteres)')
    .transform((val) => sanitizeText(val)),

  contact_name: z
    .string()
    .max(MAX_TEXT_SHORT, 'El nombre de contacto es muy largo')
    .optional()
    .nullable()
    .transform((val) => sanitizeText(val || '') || null)
    .refine((val) => !val || NAME_REGEX.test(val), {
      message: 'El nombre de contacto solo puede contener letras y espacios',
    }),

  email: z.string().max(100, 'El email es muy largo').optional().nullable(),

  phone: z.string().max(50, 'El telefono es muy largo').optional().nullable(),

  address: z.string().max(MAX_TEXT_MEDIUM, 'La direccion es muy larga').optional().nullable(),

  city: z.string().max(100, 'La ciudad es muy larga').optional().nullable(),

  cuit: z.string().max(20, 'El CUIT es muy largo').optional().nullable(),

  notes: z.string().max(MAX_TEXT_LONG, 'Las notas son muy largas').optional().nullable(),
})

export type SupplierFormData = z.infer<typeof supplierSchema>

export const supplierSearchSchema = z.object({
  search: z.string().max(100, 'Busqueda muy larga').optional(),
  page: z.coerce.number().min(1).max(10000).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export type SupplierSearchParams = z.infer<typeof supplierSearchSchema>
