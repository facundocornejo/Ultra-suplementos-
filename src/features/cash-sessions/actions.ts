'use server'

import { createServerActionClient } from '@/core/infrastructure/supabase/client'
import { revalidatePath } from 'next/cache'
import {
  openSessionSchema,
  closeSessionSchema,
  cashMovementSchema,
} from './schemas/cash-session-schema'

import type { SupabaseClient } from '@supabase/supabase-js'

// Helper para asegurar que el profile del usuario existe
async function ensureUserProfile(supabase: SupabaseClient, user: { id: string; email?: string | null }) {
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existingProfile) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email || '',
        full_name: user.email?.split('@')[0] || 'Usuario',
        role: 'owner',
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return { error: 'Error al crear perfil de usuario' }
    }
  }

  return { error: null }
}

export async function getActiveSession() {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from('cash_sessions')
    .select('*')
    .eq('status', 'open')
    .order('opened_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // No hay sesión activa, no es un error
    if (error.code === 'PGRST116') {
      return { data: null, error: null }
    }
    console.error('Error fetching active session:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function openSession(formData: FormData) {
  const supabase = await createServerActionClient()

  // Verificar que no haya una sesión abierta
  const activeSessionResult = await getActiveSession()
  if (activeSessionResult.data) {
    return {
      data: null,
      error: 'Ya hay una sesión de caja abierta. Debe cerrarla antes de abrir una nueva.',
    }
  }

  // Convertir FormData a objeto
  const rawData = {
    opening_balance: formData.get('opening_balance') as string,
  }

  // Validar con Zod
  const validationResult = openSessionSchema.safeParse(rawData)

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors
    return {
      data: null,
      error: 'Error de validación',
      fieldErrors: errors,
    }
  }

  const validatedData = validationResult.data

  // Obtener usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // Asegurar que existe el profile del usuario
  const profileResult = await ensureUserProfile(supabase, user)
  if (profileResult.error) {
    return { data: null, error: profileResult.error }
  }

  // Crear la sesión
  const { data, error } = await supabase
    .from('cash_sessions')
    .insert({
      opened_by: user.id,
      opening_balance: validatedData.opening_balance,
      expected_balance: validatedData.opening_balance,
      status: 'open',
    })
    .select()
    .single()

  if (error) {
    console.error('Error opening session:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/cash')
  revalidatePath('/dashboard')

  return { data, error: null }
}

export async function closeSession(sessionId: string, formData: FormData) {
  const supabase = await createServerActionClient()

  // Convertir FormData a objeto
  const rawData = {
    actual_balance: formData.get('actual_balance') as string,
    closing_notes: formData.get('closing_notes') as string | null,
  }

  // Validar con Zod
  const validationResult = closeSessionSchema.safeParse(rawData)

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors
    return {
      data: null,
      error: 'Error de validación',
      fieldErrors: errors,
    }
  }

  const validatedData = validationResult.data

  // Obtener usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // Obtener la sesión actual
  const { data: session, error: sessionError } = await supabase
    .from('cash_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    return { data: null, error: 'Sesión no encontrada' }
  }

  if (session.status !== 'open') {
    return { data: null, error: 'La sesión ya está cerrada' }
  }

  // Calcular diferencia
  const difference = validatedData.actual_balance - session.expected_balance

  // Cerrar la sesión
  const { data, error } = await supabase
    .from('cash_sessions')
    .update({
      closed_by: user.id,
      closed_at: new Date().toISOString(),
      actual_balance: validatedData.actual_balance,
      difference,
      status: 'closed',
      closing_notes: validatedData.closing_notes || null,
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) {
    console.error('Error closing session:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/cash')
  revalidatePath('/dashboard')

  return { data, error: null }
}

export async function addCashMovement(sessionId: string, formData: FormData) {
  const supabase = await createServerActionClient()

  // Convertir FormData a objeto
  const rawData = {
    type: formData.get('type') as string,
    amount: formData.get('amount') as string,
    reason: formData.get('reason') as string,
  }

  // Validar con Zod
  const validationResult = cashMovementSchema.safeParse(rawData)

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors
    return {
      data: null,
      error: 'Error de validación',
      fieldErrors: errors,
    }
  }

  const validatedData = validationResult.data

  // Verificar que la sesión esté abierta
  const { data: session, error: sessionError } = await supabase
    .from('cash_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    return { data: null, error: 'Sesión no encontrada' }
  }

  if (session.status !== 'open') {
    return { data: null, error: 'La sesión está cerrada' }
  }

  // Crear el movimiento
  const { data, error } = await supabase
    .from('cash_movements')
    .insert({
      cash_session_id: sessionId,
      type: validatedData.type,
      amount: validatedData.amount,
      reason: validatedData.reason,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding cash movement:', error)
    return { data: null, error: error.message }
  }

  // Actualizar el expected_balance de la sesión
  const amountChange =
    validatedData.type === 'deposit' ? validatedData.amount : -validatedData.amount

  const { error: updateError } = await supabase
    .from('cash_sessions')
    .update({
      expected_balance: session.expected_balance + amountChange,
    })
    .eq('id', sessionId)

  if (updateError) {
    console.error('Error updating session balance:', updateError)
  }

  revalidatePath('/dashboard/cash')

  return { data, error: null }
}

export async function getCashMovements(sessionId: string) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from('cash_movements')
    .select('*')
    .eq('cash_session_id', sessionId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching cash movements:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getSessionSales(sessionId: string) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('cash_session_id', sessionId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching session sales:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getSessions(params?: { limit?: number }) {
  const supabase = await createServerActionClient()

  let query = supabase
    .from('cash_sessions')
    .select('*')
    .order('opened_at', { ascending: false })

  if (params?.limit) {
    query = query.limit(params.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching sessions:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
