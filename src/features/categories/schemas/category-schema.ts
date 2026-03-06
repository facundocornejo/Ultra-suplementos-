import { z } from 'zod'
import { sanitizeText, MAX_TEXT_SHORT, MAX_TEXT_MEDIUM } from '@/shared/lib/validations'

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(MAX_TEXT_SHORT, 'El nombre es muy largo (maximo 200 caracteres)')
    .transform((val) => sanitizeText(val)),

  description: z
    .string()
    .max(MAX_TEXT_MEDIUM, 'La descripcion es muy larga (maximo 500 caracteres)')
    .optional()
    .nullable()
    .transform((val) => sanitizeText(val || '') || null),

  icon: z
    .string()
    .max(10, 'El icono es muy largo')
    .optional()
    .nullable()
    .transform((val) => val?.trim() || null),

  sort_order: z.coerce
    .number()
    .int('Debe ser un numero entero')
    .min(0, 'No puede ser negativo')
    .max(9999, 'El orden es muy alto')
    .default(0),
})

export type CategoryFormData = z.infer<typeof categorySchema>
