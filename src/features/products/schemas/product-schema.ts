import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200, 'El nombre es muy largo'),
  description: z.string().max(1000, 'La descripción es muy larga').optional().nullable(),
  category_id: z.string().min(1, 'Debe seleccionar una categoría'),
  purchase_price: z.coerce
    .number()
    .min(0, 'El precio de compra debe ser mayor o igual a 0')
    .transform((val) => Math.round(val * 100) / 100),
  sale_price: z.coerce
    .number()
    .min(0, 'El precio de venta debe ser mayor o igual a 0')
    .transform((val) => Math.round(val * 100) / 100),
  stock: z.coerce
    .number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo'),
  min_stock: z.coerce
    .number()
    .int('El stock mínimo debe ser un número entero')
    .min(0, 'El stock mínimo no puede ser negativo'),
  expiration_date: z.string().optional().nullable(),
  image_url: z.string().optional().nullable().transform((val) => val || null),
  location_id: z.string().min(1, 'Debe seleccionar una ubicación'),
}).refine(
  (data) => data.sale_price >= data.purchase_price,
  {
    message: 'El precio de venta debe ser mayor o igual al precio de compra',
    path: ['sale_price'],
  }
).refine(
  (data) => {
    if (!data.expiration_date) return true
    const expirationDate = new Date(data.expiration_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return expirationDate >= today
  },
  {
    message: 'La fecha de vencimiento debe ser futura',
    path: ['expiration_date'],
  }
)

export type ProductFormData = z.infer<typeof productSchema>

// Schema para crear desde FormData
export const productFormDataSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Debe seleccionar una categoría'),
  purchase_price: z.string().min(1, 'El precio de compra es requerido'),
  sale_price: z.string().min(1, 'El precio de venta es requerido'),
  stock: z.string().min(1, 'El stock es requerido'),
  min_stock: z.string().min(1, 'El stock mínimo es requerido'),
  expiration_date: z.string().optional(),
  image_url: z.string().optional(),
  location_id: z.string().min(1, 'Debe seleccionar una ubicación'),
})

export type ProductFormDataInput = z.infer<typeof productFormDataSchema>
