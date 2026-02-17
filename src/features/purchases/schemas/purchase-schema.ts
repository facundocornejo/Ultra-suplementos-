import { z } from 'zod'
import {
  moneySchema,
  quantitySchema,
  notesSchema,
  isNotFutureDate,
  isFutureDate,
  MAX_QUANTITY,
} from '@/shared/lib/validations'

export const purchaseItemSchema = z.object({
  product_id: z
    .string()
    .min(1, 'Debe seleccionar un producto')
    .uuid('Producto invalido'),

  quantity: z.coerce
    .number()
    .int('La cantidad debe ser un numero entero')
    .min(1, 'La cantidad debe ser al menos 1')
    .max(MAX_QUANTITY, 'La cantidad es demasiado alta'),

  unit_cost: moneySchema.refine((val) => val > 0, {
    message: 'El costo unitario debe ser mayor a 0',
  }),

  expiration_date: z
    .string()
    .optional()
    .nullable()
    .refine((val) => isFutureDate(val || ''), {
      message: 'La fecha de vencimiento debe ser futura',
    }),
})

export const purchaseSchema = z.object({
  supplier_id: z
    .string()
    .min(1, 'Debe seleccionar un proveedor')
    .uuid('Proveedor invalido'),

  payment_method: z.enum(['cash', 'transfer', 'check', 'credit', 'other'], {
    message: 'Debe seleccionar un metodo de pago valido',
  }),

  payment_status: z.enum(['paid', 'pending', 'partial'], {
    message: 'Estado de pago invalido',
  }),

  notes: notesSchema,

  purchase_date: z
    .string()
    .min(1, 'La fecha de compra es requerida')
    .refine((val) => isNotFutureDate(val), {
      message: 'La fecha de compra no puede ser futura',
    }),

  items: z
    .array(purchaseItemSchema)
    .min(1, 'Debe agregar al menos un producto')
    .max(100, 'No puede agregar mas de 100 productos en una compra')
    .refine(
      (items) => {
        // Verificar que no haya productos duplicados
        const productIds = items.map((item) => item.product_id)
        return new Set(productIds).size === productIds.length
      },
      { message: 'No puede agregar el mismo producto dos veces' }
    ),
})
  .refine(
    (data) => {
      // Validar que el total no exceda el limite
      const total = data.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_cost,
        0
      )
      return total <= 99999999
    },
    {
      message: 'El total de la compra excede el limite permitido',
      path: ['items'],
    }
  )

export type PurchaseFormData = z.infer<typeof purchaseSchema>
export type PurchaseItemFormData = z.infer<typeof purchaseItemSchema>
