'use server'

import { createServerActionClient } from '@/core/infrastructure/supabase/client'
import { revalidatePath } from 'next/cache'
import { saleSchema, type SaleFormData } from './schemas/sale-schema'

export async function createSale(saleData: SaleFormData) {
  const supabase = await createServerActionClient()

  // Log para debug
  console.log('createSale received:', JSON.stringify(saleData, null, 2))

  // Validar con Zod
  const validationResult = saleSchema.safeParse(saleData)

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors
    console.error('Validation errors:', JSON.stringify(validationResult.error.format(), null, 2))
    return {
      data: null,
      error: 'Error de validación',
      fieldErrors: errors,
    }
  }

  const validatedData = validationResult.data

  // Verificar stock disponible para todos los productos
  for (const item of validatedData.items) {
    const { data: product, error } = await supabase
      .from('products')
      .select('stock, name')
      .eq('id', item.product_id)
      .single()

    if (error) {
      return {
        data: null,
        error: `Error al verificar stock del producto: ${error.message}`,
      }
    }

    if (!product) {
      return {
        data: null,
        error: `Producto no encontrado`,
      }
    }

    if (product.stock < item.quantity) {
      return {
        data: null,
        error: `Stock insuficiente para ${product.name}. Stock disponible: ${product.stock}`,
      }
    }
  }

  // Obtener sesión de caja activa
  const { data: activeSession } = await supabase
    .from('cash_sessions')
    .select('id')
    .eq('status', 'open')
    .order('opened_at', { ascending: false })
    .limit(1)
    .single()

  // Generar sale_number con formato YYYYMMDD-NNN
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')

  // Obtener el último número de venta del día
  const { data: lastSale } = await supabase
    .from('sales')
    .select('sale_number')
    .like('sale_number', `${dateStr}-%`)
    .order('sale_number', { ascending: false })
    .limit(1)
    .single()

  let sequence = 1
  if (lastSale?.sale_number) {
    const lastSeq = parseInt(lastSale.sale_number.split('-')[1], 10)
    if (!isNaN(lastSeq)) {
      sequence = lastSeq + 1
    }
  }
  const saleNumber = `${dateStr}-${sequence.toString().padStart(3, '0')}`

  // Crear la venta
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      sale_number: saleNumber,
      customer_id: validatedData.customer_id,
      payment_method: validatedData.payment_method,
      subtotal: validatedData.subtotal,
      discount_amount: validatedData.discount_amount ?? 0,
      total: validatedData.total,
      cash_session_id: activeSession?.id || null,
    })
    .select()
    .single()

  if (saleError) {
    console.error('Error creating sale:', saleError)
    return {
      data: null,
      error: `Error al crear la venta: ${saleError.message}`,
    }
  }

  // Crear los items de la venta
  const saleItems = validatedData.items.map((item) => ({
    sale_id: sale.id,
    product_id: item.product_id,
    product_name: item.product_name,
    product_sku: item.product_sku || null,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.subtotal,
  }))

  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(saleItems)

  if (itemsError) {
    console.error('Error creating sale items:', itemsError)
    // Revertir la venta si falla la creación de items
    await supabase.from('sales').delete().eq('id', sale.id)
    return {
      data: null,
      error: `Error al crear los items de la venta: ${itemsError.message}`,
    }
  }

  // NOTA: El trigger de la DB (trigger_update_stock_on_sale) ya:
  // 1. Decrementa el stock automáticamente
  // 2. Crea los movimientos de stock
  // No es necesario hacerlo manualmente aquí

  revalidatePath('/dashboard/sales')
  revalidatePath('/dashboard/products')

  return {
    data: sale,
    error: null,
  }
}

export async function getSale(id: string) {
  const supabase = await createServerActionClient()

  const { data: sale, error } = await supabase
    .from('sales')
    .select(`
      *,
      sale_items (
        *,
        products (
          id,
          name,
          sku
        )
      ),
      customers (
        id,
        full_name,
        email,
        phone
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching sale:', error)
    return { data: null, error: error.message }
  }

  return { data: sale, error: null }
}

export async function getSales(params?: {
  startDate?: string
  endDate?: string
  paymentMethod?: string
}) {
  const supabase = await createServerActionClient()

  let query = supabase
    .from('sales')
    .select(`
      *,
      customers (
        id,
        full_name
      )
    `)
    .order('created_at', { ascending: false })

  // Filtros de fecha
  if (params?.startDate) {
    query = query.gte('created_at', params.startDate)
  }

  if (params?.endDate) {
    query = query.lte('created_at', params.endDate)
  }

  // Filtro de método de pago
  if (params?.paymentMethod) {
    query = query.eq('payment_method', params.paymentMethod)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching sales:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getTodaySales() {
  const supabase = await createServerActionClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const { data, error } = await supabase
    .from('sales')
    .select('total')
    .gte('created_at', todayISO)

  if (error) {
    console.error('Error fetching today sales:', error)
    return { total: 0, count: 0, error: error.message }
  }

  const total = data.reduce((sum, sale) => sum + sale.total, 0)
  const count = data.length

  return { total, count, error: null }
}
