'use server'

import { createServerActionClient } from '@/core/infrastructure/supabase/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supplierSchema } from './schemas/supplier-schema'

export async function getSuppliers(params?: {
  search?: string
  page?: number
  limit?: number
}) {
  const supabase = await createServerActionClient()
  const page = params?.page || 1
  const limit = params?.limit || 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('suppliers')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('business_name', { ascending: true })
    .range(offset, offset + limit - 1)

  if (params?.search) {
    query = query.or(
      `business_name.ilike.%${params.search}%,contact_name.ilike.%${params.search}%,cuit.ilike.%${params.search}%,phone.ilike.%${params.search}%`
    )
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching suppliers:', error)
    return { data: null, error: error.message, count: 0 }
  }

  return { data, error: null, count: count || 0 }
}

export async function getSupplier(id: string) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching supplier:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function searchSuppliers(search: string) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from('suppliers')
    .select('id, business_name, contact_name, cuit')
    .eq('is_active', true)
    .or(
      `business_name.ilike.%${search}%,cuit.ilike.%${search}%`
    )
    .limit(10)

  if (error) {
    console.error('Error searching suppliers:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createSupplier(formData: FormData) {
  const supabase = await createServerActionClient()

  const rawData = {
    business_name: formData.get('business_name') as string,
    contact_name: (formData.get('contact_name') as string) || null,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    address: (formData.get('address') as string) || null,
    city: (formData.get('city') as string) || null,
    cuit: (formData.get('cuit') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }

  const cleanedData = {
    ...rawData,
    contact_name: rawData.contact_name?.trim() || null,
    email: rawData.email?.trim() || null,
    phone: rawData.phone?.trim() || null,
    address: rawData.address?.trim() || null,
    city: rawData.city?.trim() || null,
    cuit: rawData.cuit?.trim() || null,
    notes: rawData.notes?.trim() || null,
  }

  const validationResult = supplierSchema.safeParse(cleanedData)

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors
    return {
      data: null,
      error: 'Error de validación',
      fieldErrors: errors,
    }
  }

  const { data, error } = await supabase
    .from('suppliers')
    .insert(validationResult.data)
    .select()
    .single()

  if (error) {
    console.error('Error creating supplier:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/suppliers')
  redirect('/dashboard/suppliers')
}

export async function updateSupplier(id: string, formData: FormData) {
  const supabase = await createServerActionClient()

  const rawData = {
    business_name: formData.get('business_name') as string,
    contact_name: (formData.get('contact_name') as string) || null,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    address: (formData.get('address') as string) || null,
    city: (formData.get('city') as string) || null,
    cuit: (formData.get('cuit') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }

  const cleanedData = {
    ...rawData,
    contact_name: rawData.contact_name?.trim() || null,
    email: rawData.email?.trim() || null,
    phone: rawData.phone?.trim() || null,
    address: rawData.address?.trim() || null,
    city: rawData.city?.trim() || null,
    cuit: rawData.cuit?.trim() || null,
    notes: rawData.notes?.trim() || null,
  }

  const validationResult = supplierSchema.safeParse(cleanedData)

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors
    return {
      data: null,
      error: 'Error de validación',
      fieldErrors: errors,
    }
  }

  const { data, error } = await supabase
    .from('suppliers')
    .update(validationResult.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating supplier:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/suppliers')
  revalidatePath(`/dashboard/suppliers/${id}`)
  redirect('/dashboard/suppliers')
}

export async function deleteSupplier(id: string) {
  const supabase = await createServerActionClient()

  // Soft delete
  const { error } = await supabase
    .from('suppliers')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    console.error('Error deleting supplier:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/suppliers')
  return { error: null }
}

export async function getSupplierPurchases(supplierId: string) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from('purchases')
    .select(`
      id,
      purchase_number,
      total,
      payment_status,
      purchase_date
    `)
    .eq('supplier_id', supplierId)
    .order('purchase_date', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching supplier purchases:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
