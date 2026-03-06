'use server'

import { createServerActionClient } from '@/core/infrastructure/supabase/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { categorySchema } from './schemas/category-schema'

export async function getCategories() {
  const supabase = await createServerActionClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getCategory(id: string) {
  const supabase = await createServerActionClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createCategory(formData: FormData) {
  const supabase = await createServerActionClient()

  const rawData = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    icon: (formData.get('icon') as string) || null,
    sort_order: formData.get('sort_order') as string || '0',
  }

  const validationResult = categorySchema.safeParse(rawData)

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors
    return {
      data: null,
      error: 'Error de validacion',
      fieldErrors: errors,
    }
  }

  const { error } = await supabase
    .from('categories')
    .insert(validationResult.data)

  if (error) {
    console.error('Error creating category:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/categories')
  revalidatePath('/dashboard/products')
  redirect('/dashboard/categories')
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createServerActionClient()

  const rawData = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    icon: (formData.get('icon') as string) || null,
    sort_order: formData.get('sort_order') as string || '0',
  }

  const validationResult = categorySchema.safeParse(rawData)

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors
    return {
      data: null,
      error: 'Error de validacion',
      fieldErrors: errors,
    }
  }

  const { error } = await supabase
    .from('categories')
    .update(validationResult.data)
    .eq('id', id)

  if (error) {
    console.error('Error updating category:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/categories')
  revalidatePath('/dashboard/products')
  redirect('/dashboard/categories')
}

export async function deleteCategory(id: string) {
  const supabase = await createServerActionClient()

  // Verificar si hay productos usando esta categoria
  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if (count && count > 0) {
    return { error: `No se puede eliminar: ${count} producto(s) usan esta categoria` }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting category:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/categories')
  revalidatePath('/dashboard/products')
  return { error: null }
}
