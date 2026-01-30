import { z } from 'zod'

export const openSessionSchema = z.object({
  opening_balance: z.coerce
    .number()
    .min(0, 'El saldo inicial debe ser mayor o igual a 0')
    .transform((val) => Math.round(val * 100) / 100),
})

export const closeSessionSchema = z.object({
  actual_balance: z.coerce
    .number()
    .min(0, 'El saldo real debe ser mayor o igual a 0')
    .transform((val) => Math.round(val * 100) / 100),
  closing_notes: z.string().max(500, 'Las notas son muy largas').optional().nullable(),
})

export const cashMovementSchema = z.object({
  type: z.enum(['deposit', 'withdrawal'], {
    message: 'Tipo de movimiento inválido',
  }),
  amount: z.coerce
    .number()
    .positive('El monto debe ser mayor a 0')
    .transform((val) => Math.round(val * 100) / 100),
  reason: z.string().min(3, 'Debe especificar un motivo').max(200, 'El motivo es muy largo'),
})

export type OpenSessionFormData = z.infer<typeof openSessionSchema>
export type CloseSessionFormData = z.infer<typeof closeSessionSchema>
export type CashMovementFormData = z.infer<typeof cashMovementSchema>
