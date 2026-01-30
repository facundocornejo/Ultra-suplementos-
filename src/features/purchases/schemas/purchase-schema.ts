import { z } from 'zod'

export const purchaseItemSchema = z.object({
  product_id: z.string().min(1, 'Debe seleccionar un producto'),
  quantity: z.coerce
    .number()
    .int('La cantidad debe ser un numero entero')
    .min(1, 'La cantidad debe ser al menos 1'),
  unit_cost: z.coerce
    .number()
    .min(0, 'El costo unitario debe ser mayor o igual a 0')
    .transform((val) => Math.round(val * 100) / 100),
  expiration_date: z.string().optional().nullable(),
})

export const purchaseSchema = z.object({
  supplier_id: z.string().min(1, 'Debe seleccionar un proveedor'),
  payment_method: z.string().min(1, 'Debe seleccionar un metodo de pago'),
  payment_status: z.enum(['paid', 'pending'], {
    error: 'Estado de pago invalido',
  }),
  notes: z.string().max(500, 'Las notas son muy largas').optional().nullable(),
  purchase_date: z.string().min(1, 'La fecha es requerida'),
  items: z.array(purchaseItemSchema).min(1, 'Debe agregar al menos un item'),
})

export type PurchaseFormData = z.infer<typeof purchaseSchema>
export type PurchaseItemFormData = z.infer<typeof purchaseItemSchema>
