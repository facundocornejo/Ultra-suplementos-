'use server'

import { createServerActionClient } from '@/core/infrastructure/supabase/client'
import { revalidatePath } from 'next/cache'
import {
  paymentSurchargesSchema,
  type PaymentSurcharges,
  DEFAULT_SURCHARGES,
} from './schemas/settings-schema'

export async function getPaymentSurcharges(): Promise<{
  data: PaymentSurcharges | null
  error: string | null
}> {
  const supabase = await createServerActionClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'payment_surcharges')
    .single()

  if (error) {
    // Si no existe, devolver valores por defecto
    return { data: DEFAULT_SURCHARGES, error: null }
  }

  // Validar que el valor tenga la estructura correcta
  const result = paymentSurchargesSchema.safeParse(data.value)
  if (!result.success) {
    return { data: DEFAULT_SURCHARGES, error: null }
  }

  return { data: result.data, error: null }
}

export async function updatePaymentSurcharges(
  surcharges: PaymentSurcharges
): Promise<{ error: string | null }> {
  const supabase = await createServerActionClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autenticado' }
  }

  // Validar con Zod
  const result = paymentSurchargesSchema.safeParse(surcharges)
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    const firstError = Object.values(errors)[0]?.[0]
    return { error: firstError || 'Datos inválidos' }
  }

  const { error } = await supabase
    .from('app_settings')
    .upsert({
      key: 'payment_surcharges',
      value: result.data,
      description: 'Porcentajes de recargo por método de pago',
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'key',
    })

  if (error) {
    console.error('Error updating payment surcharges:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/sales')
  revalidatePath('/dashboard/settings')
  return { error: null }
}
