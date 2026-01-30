import { z } from 'zod'

export const saleItemSchema = z.object({
  product_id: z.string().min(1, 'ID de producto requerido'),
  product_name: z.string().min(1, 'Nombre de producto requerido'),
  product_sku: z.string().optional().nullable(),
  quantity: z.number().int('La cantidad debe ser un número entero').min(1, 'La cantidad debe ser mayor a 0'),
  unit_price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  subtotal: z.number().min(0, 'El subtotal debe ser mayor o igual a 0'),
})

export const saleSchema = z.object({
  customer_id: z.string().uuid('ID de cliente inválido').optional().nullable(),
  payment_method: z.enum(['cash', 'debit', 'credit', 'transfer', 'mercadopago'], {
    message: 'Método de pago inválido',
  }),
  subtotal: z.number().min(0, 'El subtotal debe ser mayor o igual a 0'),
  discount_amount: z.number().min(0, 'El descuento debe ser mayor o igual a 0').optional().default(0),
  total: z.number().min(0, 'El total debe ser mayor o igual a 0'),
  items: z.array(saleItemSchema).min(1, 'Debe haber al menos un item en la venta'),
})

export type SaleFormData = z.infer<typeof saleSchema>
export type SaleItemFormData = z.infer<typeof saleItemSchema>
