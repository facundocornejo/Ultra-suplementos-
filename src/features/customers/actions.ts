'use server'

import { createServerActionClient } from '@/core/infrastructure/supabase/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { customerSchema } from './schemas/customer-schema'

export async function getCustomers(params?: {
  search?: string
  page?: number
  limit?: number
}) {
  const supabase = await createServerActionClient()
  const page = params?.page || 1
  const limit = params?.limit || 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('full_name', { ascending: true })
    .range(offset, offset + limit - 1)

  if (params?.search) {
    query = query.or(
      `full_name.ilike.%${params.search}%,email.ilike.%${params.search}%,phone.ilike.%${params.search}%,dni.ilike.%${params.search}%`
    )
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching customers:', error)
    return { data: null, error: error.message, count: 0 }
  }

  return { data, error: null, count: count || 0 }
}

export async function getCustomer(id: string) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching customer:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function searchCustomers(search: string) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from('customers')
    .select('id, full_name, phone, dni')
    .eq('is_active', true)
    .or(
      `full_name.ilike.%${search}%,phone.ilike.%${search}%,dni.ilike.%${search}%`
    )
    .limit(10)

  if (error) {
    console.error('Error searching customers:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createCustomer(formData: FormData) {
  const supabase = await createServerActionClient()

  const rawData = {
    full_name: formData.get('full_name') as string,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    dni: (formData.get('dni') as string) || null,
    address: (formData.get('address') as string) || null,
    city: (formData.get('city') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }

  // Limpiar valores vacíos
  const cleanedData = {
    ...rawData,
    email: rawData.email?.trim() || null,
    phone: rawData.phone?.trim() || null,
    dni: rawData.dni?.trim() || null,
    address: rawData.address?.trim() || null,
    city: rawData.city?.trim() || null,
    notes: rawData.notes?.trim() || null,
  }

  const validationResult = customerSchema.safeParse(cleanedData)

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors
    return {
      data: null,
      error: 'Error de validación',
      fieldErrors: errors,
    }
  }

  const { data, error } = await supabase
    .from('customers')
    .insert(validationResult.data)
    .select()
    .single()

  if (error) {
    console.error('Error creating customer:', error)
    if (error.code === '23505' && error.message.includes('dni')) {
      return { data: null, error: 'Ya existe un cliente con ese DNI' }
    }
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/customers')
  redirect('/dashboard/customers')
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createServerActionClient()

  const rawData = {
    full_name: formData.get('full_name') as string,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    dni: (formData.get('dni') as string) || null,
    address: (formData.get('address') as string) || null,
    city: (formData.get('city') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }

  const cleanedData = {
    ...rawData,
    email: rawData.email?.trim() || null,
    phone: rawData.phone?.trim() || null,
    dni: rawData.dni?.trim() || null,
    address: rawData.address?.trim() || null,
    city: rawData.city?.trim() || null,
    notes: rawData.notes?.trim() || null,
  }

  const validationResult = customerSchema.safeParse(cleanedData)

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors
    return {
      data: null,
      error: 'Error de validación',
      fieldErrors: errors,
    }
  }

  const { data, error } = await supabase
    .from('customers')
    .update(validationResult.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating customer:', error)
    if (error.code === '23505' && error.message.includes('dni')) {
      return { data: null, error: 'Ya existe un cliente con ese DNI' }
    }
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/customers')
  revalidatePath(`/dashboard/customers/${id}`)
  redirect('/dashboard/customers')
}

export async function deleteCustomer(id: string) {
  const supabase = await createServerActionClient()

  // Soft delete
  const { error } = await supabase
    .from('customers')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    console.error('Error deleting customer:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/customers')
  return { error: null }
}

export async function getCustomerSales(customerId: string) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from('sales')
    .select(`
      id,
      sale_number,
      total,
      payment_method,
      created_at
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching customer sales:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
