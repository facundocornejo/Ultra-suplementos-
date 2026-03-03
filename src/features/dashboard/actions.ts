'use server'

import { createServerActionClient } from '@/core/infrastructure/supabase/client'

export async function getDashboardStats() {
  const supabase = await createServerActionClient()

  // Obtener ventas de hoy
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const { data: todaySales } = await supabase
    .from('sales')
    .select('total')
    .gte('created_at', todayISO)

  const totalSalesToday = todaySales?.reduce((sum, sale) => sum + sale.total, 0) || 0
  const salesCount = todaySales?.length || 0

  // Obtener total de productos
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  // Obtener productos con stock bajo usando la vista de la DB
  const { count: lowStockFromView, error: lowStockError } = await supabase
    .from('products_low_stock')
    .select('*', { count: 'exact', head: true })

  // Si la vista falla, contar manualmente
  let finalLowStockCount = lowStockFromView || 0
  if (lowStockError) {
    const { data: allProducts } = await supabase
      .from('products')
      .select('stock, min_stock')
      .eq('is_active', true)

    finalLowStockCount = allProducts?.filter(p => p.stock <= p.min_stock).length || 0
  }

  // Obtener productos próximos a vencer (3 meses)
  const threeMonthsFromNow = new Date()
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
  const threeMonthsISO = threeMonthsFromNow.toISOString()

  const { data: expiringProducts } = await supabase
    .from('products')
    .select('*')
    .not('expiration_date', 'is', null)
    .lte('expiration_date', threeMonthsISO)

  const expiringCount = expiringProducts?.length || 0

  return {
    totalSalesToday,
    salesCount,
    productsCount: productsCount || 0,
    lowStockCount: finalLowStockCount,
    expiringCount,
  }
}

export async function getLowStockProducts() {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .order('stock', { ascending: true })

  if (error) {
    console.error('Error fetching low stock products:', error)
    return { data: null, error: error.message }
  }

  // Filtrar en memoria productos con stock bajo
  const lowStockProducts = data?.filter(p => p.stock <= p.min_stock) || []

  return { data: lowStockProducts, error: null }
}

export async function getExpiringProducts() {
  const supabase = await createServerActionClient()

  const threeMonthsFromNow = new Date()
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .not('expiration_date', 'is', null)
    .order('expiration_date', { ascending: true })

  if (error) {
    console.error('Error fetching expiring products:', error)
    return { data: null, error: error.message }
  }

  // Filtrar productos que vencen en los próximos 3 meses
  const expiringProducts = data?.filter(p => {
    if (!p.expiration_date) return false
    const expirationDate = new Date(p.expiration_date)
    return expirationDate <= threeMonthsFromNow
  }) || []

  return { data: expiringProducts, error: null }
}

export async function getRecentSales(limit: number = 5) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      customers (
        id,
        full_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent sales:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getSalesStats() {
  const supabase = await createServerActionClient()

  // Ventas de hoy
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const { data: todaySales } = await supabase
    .from('sales')
    .select('total, payment_method')
    .gte('created_at', todayISO)

  const totalToday = todaySales?.reduce((sum, sale) => sum + sale.total, 0) || 0

  // Ventas de ayer
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayISO = yesterday.toISOString()

  const { data: yesterdaySales } = await supabase
    .from('sales')
    .select('total')
    .gte('created_at', yesterdayISO)
    .lt('created_at', todayISO)

  const totalYesterday = yesterdaySales?.reduce((sum, sale) => sum + sale.total, 0) || 0

  // Calcular crecimiento
  let growth = 0
  if (totalYesterday > 0) {
    growth = ((totalToday - totalYesterday) / totalYesterday) * 100
  }

  // Ventas por método de pago (hoy)
  const paymentMethods: Record<string, number> = {}
  todaySales?.forEach(sale => {
    paymentMethods[sale.payment_method] = (paymentMethods[sale.payment_method] || 0) + sale.total
  })

  return {
    totalToday,
    totalYesterday,
    growth,
    paymentMethods,
  }
}
