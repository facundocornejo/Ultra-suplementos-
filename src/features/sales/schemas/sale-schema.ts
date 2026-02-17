import { z } from 'zod'
import {
  moneySchema,
  MAX_QUANTITY,
  MAX_PRICE,
} from '@/shared/lib/validations'

export const saleItemSchema = z.object({
  product_id: z
    .string()
    .min(1, 'ID de producto requerido')
    .uuid('Producto invalido'),

  product_name: z
    .string()
    .min(1, 'Nombre de producto requerido')
    .max(200, 'Nombre de producto muy largo'),

  product_sku: z.string().max(50, 'SKU muy largo').optional().nullable(),

  quantity: z
    .number()
    .int('La cantidad debe ser un numero entero')
    .min(1, 'La cantidad debe ser mayor a 0')
    .max(MAX_QUANTITY, 'La cantidad es demasiado alta'),

  unit_price: z
    .number()
    .min(0, 'El precio debe ser mayor o igual a 0')
    .max(MAX_PRICE, 'El precio es demasiado alto'),

  subtotal: z
    .number()
    .min(0, 'El subtotal debe ser mayor o igual a 0')
    .max(MAX_PRICE, 'El subtotal es demasiado alto'),
})

export const saleSchema = z.object({
  customer_id: z
    .string()
    .uuid('Cliente invalido')
    .optional()
    .nullable(),

  payment_method: z.enum(['cash', 'debit', 'credit', 'transfer', 'mercadopago'], {
    message: 'Debe seleccionar un metodo de pago valido',
  }),

  subtotal: z
    .number()
    .min(0, 'El subtotal debe ser mayor o igual a 0')
    .max(MAX_PRICE, 'El subtotal es demasiado alto'),

  discount_amount: z
    .number()
    .min(0, 'El descuento debe ser mayor o igual a 0')
    .max(MAX_PRICE, 'El descuento es demasiado alto')
    .optional()
    .default(0),

  total: z
    .number()
    .min(0, 'El total debe ser mayor a 0')
    .max(MAX_PRICE, 'El total es demasiado alto'),

  items: z
    .array(saleItemSchema)
    .min(1, 'Debe haber al menos un producto en la venta')
    .max(50, 'No puede agregar mas de 50 productos en una venta'),
})
  .refine(
    (data) => data.discount_amount <= data.subtotal,
    {
      message: 'El descuento no puede ser mayor al subtotal',
      path: ['discount_amount'],
    }
  )
  .refine(
    (data) => {
      const calculatedTotal = data.subtotal - (data.discount_amount || 0)
      // Permitir una pequena diferencia por redondeo
      return Math.abs(data.total - calculatedTotal) < 1
    },
    {
      message: 'El total no coincide con subtotal menos descuento',
      path: ['total'],
    }
  )
  .refine(
    (data) => {
      // Verificar que el subtotal de items coincida
      const itemsTotal = data.items.reduce((sum, item) => sum + item.subtotal, 0)
      return Math.abs(data.subtotal - itemsTotal) < 1
    },
    {
      message: 'El subtotal no coincide con la suma de los items',
      path: ['subtotal'],
    }
  )

export type SaleFormData = z.infer<typeof saleSchema>
export type SaleItemFormData = z.infer<typeof saleItemSchema>
