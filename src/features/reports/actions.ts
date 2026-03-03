'use server'

import { createServerActionClient } from '@/core/infrastructure/supabase/client'

export interface DateRange {
  from: string
  to: string
}

export async function getSalesSummary(dateRange: DateRange) {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  const { data, error } = await supabase
    .from('sales')
    .select('total, payment_method, created_at')
    .gte('created_at', dateRange.from)
    .lte('created_at', dateRange.to + 'T23:59:59')

  if (error) {
    console.error('Error fetching sales summary:', error)
    return { data: null, error: error.message }
  }

  // Calcular resumen
  const summary = {
    totalSales: data.length,
    totalRevenue: data.reduce((sum, sale) => sum + Number(sale.total), 0),
    byPaymentMethod: {
      cash: 0,
      debit: 0,
      credit: 0,
      transfer: 0,
      mercadopago: 0,
    },
    dailySales: {} as Record<string, { count: number; total: number }>,
  }

  data.forEach((sale) => {
    // Por método de pago
    const method = sale.payment_method as keyof typeof summary.byPaymentMethod
    summary.byPaymentMethod[method] += Number(sale.total)

    // Por día
    const date = sale.created_at.split('T')[0]
    if (!summary.dailySales[date]) {
      summary.dailySales[date] = { count: 0, total: 0 }
    }
    summary.dailySales[date].count++
    summary.dailySales[date].total += Number(sale.total)
  })

  return { data: summary, error: null }
}

export async function getTopProducts(dateRange: DateRange, limit: number = 10) {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // Obtener items de venta en el rango
  const { data: saleItems, error } = await supabase
    .from('sale_items')
    .select(`
      product_id,
      product_name,
      quantity,
      subtotal,
      sales!inner (
        created_at
      )
    `)
    .gte('sales.created_at', dateRange.from)
    .lte('sales.created_at', dateRange.to + 'T23:59:59')

  if (error) {
    console.error('Error fetching top products:', error)
    return { data: null, error: error.message }
  }

  // Agrupar por producto
  const productStats: Record<string, {
    product_id: string
    product_name: string
    quantity: number
    revenue: number
  }> = {}

  saleItems.forEach((item) => {
    if (!productStats[item.product_id]) {
      productStats[item.product_id] = {
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: 0,
        revenue: 0,
      }
    }
    productStats[item.product_id].quantity += item.quantity
    productStats[item.product_id].revenue += Number(item.subtotal)
  })

  // Ordenar por cantidad vendida
  const topProducts = Object.values(productStats)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)

  return { data: topProducts, error: null }
}

export async function getStockReport() {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // Productos con stock bajo (stock <= min_stock)
  const { data: lowStock, error: lowStockError } = await supabase
    .from('products')
    .select('id, name, stock, min_stock, sale_price')
    .lte('stock', 5)
    .eq('is_active', true)
    .order('stock', { ascending: true })

  if (lowStockError) {
    console.error('Error fetching low stock:', lowStockError)
  }

  // Productos próximos a vencer
  const threeMonthsFromNow = new Date()
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)

  const { data: expiringSoon, error: expiringError } = await supabase
    .from('products')
    .select('id, name, stock, expiration_date, sale_price')
    .not('expiration_date', 'is', null)
    .lte('expiration_date', threeMonthsFromNow.toISOString().split('T')[0])
    .eq('is_active', true)
    .order('expiration_date', { ascending: true })

  if (expiringError) {
    console.error('Error fetching expiring products:', expiringError)
  }

  // Valor total del inventario
  const { data: inventory, error: inventoryError } = await supabase
    .from('products')
    .select('stock, purchase_price, sale_price')
    .eq('is_active', true)

  if (inventoryError) {
    console.error('Error fetching inventory value:', inventoryError)
  }

  const inventoryValue = {
    costValue: inventory?.reduce((sum, p) => sum + (p.stock * Number(p.purchase_price)), 0) || 0,
    saleValue: inventory?.reduce((sum, p) => sum + (p.stock * Number(p.sale_price)), 0) || 0,
    totalProducts: inventory?.length || 0,
    totalUnits: inventory?.reduce((sum, p) => sum + p.stock, 0) || 0,
  }

  return {
    data: {
      lowStock: lowStock || [],
      expiringSoon: expiringSoon || [],
      inventoryValue,
    },
    error: null,
  }
}

export async function getCashSessionsReport(dateRange: DateRange) {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  const { data, error } = await supabase
    .from('cash_sessions')
    .select(`
      id,
      opened_at,
      closed_at,
      opening_balance,
      total_sales,
      total_cash_sales,
      total_card_sales,
      total_transfer_sales,
      total_mp_sales,
      total_deposits,
      total_withdrawals,
      expected_balance,
      actual_balance,
      difference,
      status
    `)
    .gte('opened_at', dateRange.from)
    .lte('opened_at', dateRange.to + 'T23:59:59')
    .order('opened_at', { ascending: false })

  if (error) {
    console.error('Error fetching cash sessions:', error)
    return { data: null, error: error.message }
  }

  // Calcular totales
  const summary = {
    totalSessions: data.length,
    closedSessions: data.filter((s) => s.status === 'closed').length,
    totalSales: data.reduce((sum, s) => sum + Number(s.total_sales || 0), 0),
    totalDifference: data
      .filter((s) => s.status === 'closed')
      .reduce((sum, s) => sum + Number(s.difference || 0), 0),
    sessions: data,
  }

  return { data: summary, error: null }
}

export async function getStockMovementsReport(dateRange: DateRange, productId?: string) {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  let query = supabase
    .from('stock_movements')
    .select(`
      id,
      type,
      quantity,
      previous_stock,
      new_stock,
      reason,
      reference_number,
      created_at,
      products (
        name
      )
    `)
    .gte('created_at', dateRange.from)
    .lte('created_at', dateRange.to + 'T23:59:59')
    .order('created_at', { ascending: false })
    .limit(100)

  if (productId) {
    query = query.eq('product_id', productId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching stock movements:', error)
    return { data: null, error: error.message }
  }

  // Resumen por tipo
  const summary = {
    purchases: 0,
    sales: 0,
    adjustments: 0,
    returns: 0,
    movements: data,
  }

  data.forEach((movement) => {
    const qty = Math.abs(movement.quantity)
    switch (movement.type) {
      case 'purchase':
        summary.purchases += qty
        break
      case 'sale':
        summary.sales += qty
        break
      case 'adjustment':
        summary.adjustments += movement.quantity
        break
      case 'return':
        summary.returns += qty
        break
    }
  })

  return { data: summary, error: null }
}

export async function getProfitReport(dateRange: DateRange) {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // Obtener ventas con items
  const { data: sales, error } = await supabase
    .from('sales')
    .select(`
      id,
      total,
      created_at,
      sale_items (
        quantity,
        unit_price,
        subtotal,
        product_id
      )
    `)
    .gte('created_at', dateRange.from)
    .lte('created_at', dateRange.to + 'T23:59:59')

  if (error) {
    console.error('Error fetching profit report:', error)
    return { data: null, error: error.message }
  }

  // Obtener costos de productos (purchase_price es el costo de compra)
  const productIds = [...new Set(sales.flatMap((s) => s.sale_items.map((i) => i.product_id)))]

  const { data: products } = await supabase
    .from('products')
    .select('id, purchase_price')
    .in('id', productIds)

  const costMap: Record<string, number> = {}
  products?.forEach((p) => {
    costMap[p.id] = Number(p.purchase_price)
  })

  // Calcular ganancia
  let totalRevenue = 0
  let totalCost = 0

  sales.forEach((sale) => {
    totalRevenue += Number(sale.total)
    sale.sale_items.forEach((item) => {
      const cost = costMap[item.product_id] || 0
      totalCost += cost * item.quantity
    })
  })

  const grossProfit = totalRevenue - totalCost
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  return {
    data: {
      totalRevenue,
      totalCost,
      grossProfit,
      profitMargin: Math.round(profitMargin * 100) / 100,
      salesCount: sales.length,
    },
    error: null,
  }
}
