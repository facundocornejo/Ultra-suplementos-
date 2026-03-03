import { z } from 'zod'

export const paymentSurchargesSchema = z.object({
  cash: z.number().min(0, 'No puede ser negativo').max(100, 'Máximo 100%'),
  debit: z.number().min(0, 'No puede ser negativo').max(100, 'Máximo 100%'),
  credit: z.number().min(0, 'No puede ser negativo').max(100, 'Máximo 100%'),
  transfer: z.number().min(0, 'No puede ser negativo').max(100, 'Máximo 100%'),
  mercadopago: z.number().min(0, 'No puede ser negativo').max(100, 'Máximo 100%'),
})

export type PaymentSurcharges = z.infer<typeof paymentSurchargesSchema>

// Valores por defecto
export const DEFAULT_SURCHARGES: PaymentSurcharges = {
  cash: 0,
  debit: 3,
  credit: 8,
  transfer: 0,
  mercadopago: 5,
}
