'use server'

import { createServerActionClient } from '@/core/infrastructure/supabase/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { purchaseSchema } from './schemas/purchase-schema'
import { escapeILike } from '@/shared/lib/formatters'

// =============================================================================
// LISTAR COMPRAS
// =============================================================================

export async function getPurchases(params?: {
  search?: string
  supplierId?: string
  page?: number
  limit?: number
}) {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado', count: 0 }
  }

  const page = params?.page || 1
  const limit = params?.limit || 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('purchases')
    .select(`
      *,
      suppliers (
        id,
        business_name
      ),
      purchase_items (
        id,
        product_id,
        quantity,
        unit_cost,
        subtotal,
        products (
          id,
          name
        )
      )
    `, { count: 'exact' })
    .order('purchase_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (params?.supplierId) {
    query = query.eq('supplier_id', params.supplierId)
  }

  if (params?.search) {
    const escaped = escapeILike(params.search)
    query = query.or(
      `purchase_number.ilike.%${escaped}%`
    )
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching purchases:', error)
    return { data: null, error: error.message, count: 0 }
  }

  return { data, error: null, count: count || 0 }
}

// =============================================================================
// OBTENER UNA COMPRA
// =============================================================================

export async function getPurchase(id: string) {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  const { data, error } = await supabase
    .from('purchases')
    .select(`
      *,
      suppliers (
        id,
        business_name,
        contact_name,
        phone,
        email
      ),
      purchase_items (
        id,
        product_id,
        quantity,
        unit_cost,
        subtotal,
        expiration_date,
        products (
          id,
          name,
          stock
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching purchase:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// =============================================================================
// CREAR COMPRA
// =============================================================================

export async function createPurchase(formData: {
  supplier_id: string
  payment_method: string
  payment_status: string
  notes?: string | null
  purchase_date: string
  items: {
    product_id: string
    quantity: number
    unit_cost: number
    expiration_date?: string | null
  }[]
}) {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // Validar con Zod
  const validationResult = purchaseSchema.safeParse(formData)
  if (!validationResult.success) {
    const errors = validationResult.error.flatten()
    return { data: null, error: 'Error de validacion', fieldErrors: errors }
  }

  const data = validationResult.data

  // Calcular subtotales y total
  const items = data.items.map((item) => ({
    ...item,
    subtotal: Math.round(item.quantity * item.unit_cost * 100) / 100,
    expiration_date: item.expiration_date?.trim() || null,
  }))
  const total = items.reduce((sum, item) => sum + item.subtotal, 0)

  // Generar numero de compra
  const today = new Date()
  const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '')

  const { count } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString().slice(0, 10))

  const purchaseNumber = `C-${datePrefix}-${String((count || 0) + 1).padStart(3, '0')}`

  // Insertar compra
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      purchase_number: purchaseNumber,
      supplier_id: data.supplier_id,
      total,
      payment_method: data.payment_method,
      payment_status: data.payment_status,
      notes: data.notes?.trim() || null,
      purchase_date: data.purchase_date,
    })
    .select()
    .single()

  if (purchaseError) {
    console.error('Error creating purchase:', purchaseError)
    return { data: null, error: purchaseError.message }
  }

  // Insertar items
  const purchaseItems = items.map((item) => ({
    purchase_id: purchase.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_cost: item.unit_cost,
    subtotal: item.subtotal,
    expiration_date: item.expiration_date,
  }))

  const { error: itemsError } = await supabase
    .from('purchase_items')
    .insert(purchaseItems)

  if (itemsError) {
    console.error('Error creating purchase items:', itemsError)
    // Rollback: eliminar la compra
    await supabase.from('purchases').delete().eq('id', purchase.id)
    return { data: null, error: itemsError.message }
  }

  // Incrementar stock de cada producto
  for (const item of items) {
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.product_id)
      .single()

    if (product) {
      const newStock = product.stock + item.quantity

      await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.product_id)

      // Registrar movimiento de stock
      await supabase.from('stock_movements').insert({
        product_id: item.product_id,
        quantity: item.quantity,
        type: 'purchase',
        reason: `Compra ${purchaseNumber}`,
        previous_stock: product.stock,
        new_stock: newStock,
      })

      // Actualizar fecha de vencimiento del producto si se proporcionó
      if (item.expiration_date) {
        await supabase
          .from('products')
          .update({ expiration_date: item.expiration_date })
          .eq('id', item.product_id)
      }
    }
  }

  revalidatePath('/dashboard/purchases')
  revalidatePath('/dashboard/products')
  revalidatePath('/dashboard/stock')
  redirect('/dashboard/purchases')
}

// =============================================================================
// ELIMINAR COMPRA
// =============================================================================

export async function deletePurchase(id: string) {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autenticado' }
  }

  // Obtener items para revertir stock
  const { data: purchase } = await supabase
    .from('purchases')
    .select(`
      purchase_number,
      purchase_items (
        product_id,
        quantity
      )
    `)
    .eq('id', id)
    .single()

  if (purchase?.purchase_items) {
    for (const item of purchase.purchase_items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single()

      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity)
        await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product_id)

        await supabase.from('stock_movements').insert({
          product_id: item.product_id,
          quantity: -item.quantity,
          type: 'adjustment',
          reason: `Compra ${purchase.purchase_number} eliminada`,
          previous_stock: product.stock,
          new_stock: newStock,
        })
      }
    }
  }

  const { error } = await supabase.from('purchases').delete().eq('id', id)

  if (error) {
    console.error('Error deleting purchase:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/purchases')
  revalidatePath('/dashboard/products')
  return { error: null }
}
