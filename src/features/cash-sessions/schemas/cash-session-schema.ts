import { z } from 'zod'
import {
  notesSchema,
  sanitizeText,
  MAX_PRICE,
} from '@/shared/lib/validations'

export const openSessionSchema = z.object({
  opening_balance: z.coerce
    .number()
    .min(0, 'El saldo inicial debe ser mayor o igual a 0')
    .max(MAX_PRICE, 'El saldo inicial es demasiado alto')
    .transform((val) => Math.round(val * 100) / 100),
})

export const closeSessionSchema = z.object({
  actual_balance: z.coerce
    .number()
    .min(0, 'El saldo real debe ser mayor o igual a 0')
    .max(MAX_PRICE, 'El saldo es demasiado alto')
    .transform((val) => Math.round(val * 100) / 100),

  closing_notes: notesSchema,
})

export const cashMovementSchema = z.object({
  type: z.enum(['deposit', 'withdrawal'], {
    message: 'Debe seleccionar un tipo de movimiento valido',
  }),

  amount: z.coerce
    .number()
    .positive('El monto debe ser mayor a 0')
    .max(MAX_PRICE, 'El monto es demasiado alto')
    .transform((val) => Math.round(val * 100) / 100),

  reason: z
    .string()
    .min(3, 'El motivo debe tener al menos 3 caracteres')
    .max(200, 'El motivo es muy largo (maximo 200 caracteres)')
    .transform((val) => sanitizeText(val))
    .refine((val) => val.length >= 3, {
      message: 'El motivo debe tener al menos 3 caracteres',
    }),
})

export type OpenSessionFormData = z.infer<typeof openSessionSchema>
export type CloseSessionFormData = z.infer<typeof closeSessionSchema>
export type CashMovementFormData = z.infer<typeof cashMovementSchema>
