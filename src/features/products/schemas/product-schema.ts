import { z } from 'zod'
import {
  moneySchema,
  quantitySchema,
  sanitizeText,
  isFutureDate,
  MAX_TEXT_SHORT,
  MAX_TEXT_LONG,
} from '@/shared/lib/validations'

export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(MAX_TEXT_SHORT, 'El nombre es muy largo (maximo 200 caracteres)')
    .transform((val) => sanitizeText(val))
    .refine((val) => val.length >= 2, {
      message: 'El nombre debe tener al menos 2 caracteres',
    }),

  description: z
    .string()
    .max(MAX_TEXT_LONG, 'La descripcion es muy larga (maximo 1000 caracteres)')
    .optional()
    .nullable()
    .transform((val) => sanitizeText(val || '') || null),

  category_id: z
    .string()
    .min(1, 'Debe seleccionar una categoria')
    .trim(),

  purchase_price: moneySchema.refine((val) => val >= 0, {
    message: 'El precio de compra debe ser mayor o igual a 0',
  }),

  sale_price: moneySchema.refine((val) => val > 0, {
    message: 'El precio de venta debe ser mayor a 0',
  }),

  stock: quantitySchema,

  min_stock: quantitySchema.refine((val) => val >= 0 && val <= 10000, {
    message: 'El stock minimo debe estar entre 0 y 10000',
  }),

  expiration_date: z
    .string()
    .optional()
    .nullable()
    .refine((val) => isFutureDate(val || ''), {
      message: 'La fecha de vencimiento debe ser futura',
    }),

  image_url: z
    .string()
    .url('URL de imagen invalida')
    .optional()
    .nullable()
    .or(z.literal(''))
    .transform((val) => val || null),

  location_id: z
    .string()
    .min(1, 'Debe seleccionar una ubicacion')
    .trim(),
})
  .refine(
    (data) => data.sale_price >= data.purchase_price,
    {
      message: 'El precio de venta debe ser mayor o igual al precio de compra',
      path: ['sale_price'],
    }
  )
  .refine(
    (data) => data.min_stock <= data.stock || data.stock === 0,
    {
      message: 'El stock minimo no puede ser mayor al stock actual (a menos que el stock sea 0)',
      path: ['min_stock'],
    }
  )

export type ProductFormData = z.infer<typeof productSchema>

// Schema para crear desde FormData (mas permisivo, se valida despues)
export const productFormDataSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Debe seleccionar una categoria'),
  purchase_price: z.string().min(1, 'El precio de compra es requerido'),
  sale_price: z.string().min(1, 'El precio de venta es requerido'),
  stock: z.string().min(1, 'El stock es requerido'),
  min_stock: z.string().min(1, 'El stock minimo es requerido'),
  expiration_date: z.string().optional(),
  image_url: z.string().optional(),
  location_id: z.string().min(1, 'Debe seleccionar una ubicacion'),
})

export type ProductFormDataInput = z.infer<typeof productFormDataSchema>
