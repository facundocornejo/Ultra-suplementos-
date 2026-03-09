'use server'

import { createServerActionClient } from '@/core/infrastructure/supabase/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { productSchema } from './schemas/product-schema'
import { escapeILike } from '@/shared/lib/formatters'

export async function getProducts(params?: {
  search?: string
  categoryId?: string
  lowStock?: boolean
  expiringSoon?: boolean
}) {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  let query = supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name
      ),
      locations (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  // Filtro de búsqueda
  if (params?.search) {
    const escaped = escapeILike(params.search)
    query = query.or(
      `name.ilike.%${escaped}%`
    )
  }

  // Filtro por categoría
  if (params?.categoryId) {
    query = query.eq('category_id', params.categoryId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return { data: null, error: error.message }
  }

  // Filtros adicionales en memoria (para views)
  let filteredData = data

  if (params?.lowStock) {
    filteredData = filteredData?.filter((p) => p.stock <= p.min_stock) || []
  }

  if (params?.expiringSoon) {
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)

    filteredData =
      filteredData?.filter((p) => {
        if (!p.expiration_date) return false
        const expirationDate = new Date(p.expiration_date)
        return expirationDate <= threeMonthsFromNow
      }) || []
  }

  return { data: filteredData, error: null }
}

export async function getProduct(id: string) {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name
      ),
      locations (
        id,
        name
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}


export async function getLocations() {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching locations:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createProduct(formData: FormData) {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // Convertir FormData a objeto
  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string | null,
    category_id: formData.get('category_id') as string,
    purchase_price: formData.get('purchase_price') as string,
    sale_price: formData.get('sale_price') as string,
    stock: formData.get('stock') as string,
    min_stock: formData.get('min_stock') as string,
    expiration_date: formData.get('expiration_date') as string | null,
    image_url: formData.get('image_url') as string | null,
    location_id: formData.get('location_id') as string,
  }

  // Limpiar valores vacíos
  const cleanedData = {
    ...rawData,
    description: rawData.description?.trim() || null,
    category_id: rawData.category_id?.trim() || '',
    location_id: rawData.location_id?.trim() || '',
    expiration_date: rawData.expiration_date?.trim() || null,
    image_url: rawData.image_url?.trim() || null,
  }

  // Validar con Zod
  const validationResult = productSchema.safeParse(cleanedData)

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors
    return {
      data: null,
      error: 'Error de validación',
      fieldErrors: errors
    }
  }

  const validatedData = validationResult.data

  // Insertar en la base de datos
  const { error } = await supabase
    .from('products')
    .insert(validatedData)

  if (error) {
    console.error('Error creating product:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/products')
  redirect('/dashboard/products')
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // Convertir FormData a objeto
  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string | null,
    category_id: formData.get('category_id') as string,
    purchase_price: formData.get('purchase_price') as string,
    sale_price: formData.get('sale_price') as string,
    stock: formData.get('stock') as string,
    min_stock: formData.get('min_stock') as string,
    expiration_date: formData.get('expiration_date') as string | null,
    image_url: formData.get('image_url') as string | null,
    location_id: formData.get('location_id') as string,
  }

  // Limpiar valores vacíos
  const cleanedData = {
    ...rawData,
    description: rawData.description?.trim() || null,
    category_id: rawData.category_id?.trim() || '',
    location_id: rawData.location_id?.trim() || '',
    expiration_date: rawData.expiration_date?.trim() || null,
    image_url: rawData.image_url?.trim() || null,
  }

  // Validar con Zod
  const validationResult = productSchema.safeParse(cleanedData)

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors
    return {
      data: null,
      error: 'Error de validación',
      fieldErrors: errors
    }
  }

  const validatedData = validationResult.data

  // Actualizar en la base de datos
  const { error } = await supabase
    .from('products')
    .update(validatedData)
    .eq('id', id)

  if (error) {
    console.error('Error updating product:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/products')
  revalidatePath(`/dashboard/products/${id}`)
  redirect('/dashboard/products')
}

export async function deleteProduct(id: string) {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autenticado' }
  }

  // Obtener el producto para eliminar la imagen si existe
  const { data: product } = await supabase
    .from('products')
    .select('image_url')
    .eq('id', id)
    .single()

  // Eliminar imagen del Storage si existe
  if (product?.image_url) {
    const url = new URL(product.image_url)
    const pathMatch = url.pathname.match(/\/product-images\/(.+)$/)
    if (pathMatch) {
      const imagePath = decodeURIComponent(pathMatch[1])
      await supabase.storage
        .from('product-images')
        .remove([imagePath])
    }
  }

  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/products')
  return { error: null }
}

// Constantes para validación de imágenes
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadProductImage(file: File, productId?: string) {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // Validar tipo de archivo
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      data: null,
      error: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WebP, GIF'
    }
  }

  // Validar tamaño de archivo
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      data: null,
      error: 'El archivo es demasiado grande. Máximo 5MB permitido'
    }
  }

  // Generar nombre único para el archivo
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${productId || Date.now()}.${fileExt}`
  const filePath = `products/${fileName}`

  // Subir archivo a Supabase Storage
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    })

  if (error) {
    console.error('Error uploading image:', error)
    return { data: null, error: error.message }
  }

  // Obtener URL pública
  const {
    data: { publicUrl },
  } = supabase.storage.from('product-images').getPublicUrl(data.path)

  return { data: { path: data.path, publicUrl }, error: null }
}
