import { z } from 'zod'

export const customerSchema = z.object({
  full_name: z.string().min(1, 'El nombre es requerido').max(200, 'El nombre es muy largo'),
  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  phone: z.string().max(50, 'El teléfono es muy largo').optional().nullable(),
  dni: z.string().max(20, 'El DNI es muy largo').optional().nullable(),
  address: z.string().max(500, 'La dirección es muy larga').optional().nullable(),
  city: z.string().max(100, 'La ciudad es muy larga').optional().nullable(),
  notes: z.string().max(1000, 'Las notas son muy largas').optional().nullable(),
})

export type CustomerFormData = z.infer<typeof customerSchema>

export const customerSearchSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export type CustomerSearchParams = z.infer<typeof customerSearchSchema>
