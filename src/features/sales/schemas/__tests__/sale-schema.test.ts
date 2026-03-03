import { describe, it, expect } from 'vitest'
import { saleSchema, saleItemSchema } from '../sale-schema'

describe('saleItemSchema', () => {
  it('valida un item de venta correcto', () => {
    const validItem = {
      product_id: '550e8400-e29b-41d4-a716-446655440000',
      product_name: 'Proteína Whey',
      product_sku: 'SKU-001',
      quantity: 2,
      unit_price: 15000,
      subtotal: 30000,
    }

    const result = saleItemSchema.safeParse(validItem)
    expect(result.success).toBe(true)
  })

  it('rechaza item sin product_id', () => {
    const invalidItem = {
      product_name: 'Proteína Whey',
      quantity: 2,
      unit_price: 15000,
      subtotal: 30000,
    }

    const result = saleItemSchema.safeParse(invalidItem)
    expect(result.success).toBe(false)
  })

  it('rechaza cantidad cero', () => {
    const invalidItem = {
      product_id: '550e8400-e29b-41d4-a716-446655440000',
      product_name: 'Proteína Whey',
      quantity: 0,
      unit_price: 15000,
      subtotal: 0,
    }

    const result = saleItemSchema.safeParse(invalidItem)
    expect(result.success).toBe(false)
  })

  it('rechaza cantidad negativa', () => {
    const invalidItem = {
      product_id: '550e8400-e29b-41d4-a716-446655440000',
      product_name: 'Proteína Whey',
      quantity: -1,
      unit_price: 15000,
      subtotal: -15000,
    }

    const result = saleItemSchema.safeParse(invalidItem)
    expect(result.success).toBe(false)
  })

  it('acepta product_sku como null', () => {
    const validItem = {
      product_id: '550e8400-e29b-41d4-a716-446655440000',
      product_name: 'Proteína Whey',
      product_sku: null,
      quantity: 1,
      unit_price: 15000,
      subtotal: 15000,
    }

    const result = saleItemSchema.safeParse(validItem)
    expect(result.success).toBe(true)
  })
})

describe('saleSchema', () => {
  const validSaleData = {
    customer_id: null,
    payment_method: 'cash' as const,
    subtotal: 30000,
    discount_amount: 0,
    total: 30000,
    items: [
      {
        product_id: '550e8400-e29b-41d4-a716-446655440000',
        product_name: 'Proteína Whey',
        product_sku: null,
        quantity: 2,
        unit_price: 15000,
        subtotal: 30000,
      },
    ],
  }

  it('valida una venta correcta', () => {
    const result = saleSchema.safeParse(validSaleData)
    expect(result.success).toBe(true)
  })

  it('acepta todos los métodos de pago válidos', () => {
    const paymentMethods = ['cash', 'debit', 'credit', 'transfer', 'mercadopago'] as const

    paymentMethods.forEach((method) => {
      const saleData = { ...validSaleData, payment_method: method }
      const result = saleSchema.safeParse(saleData)
      expect(result.success).toBe(true)
    })
  })

  it('rechaza método de pago inválido', () => {
    const saleData = { ...validSaleData, payment_method: 'bitcoin' }
    const result = saleSchema.safeParse(saleData)
    expect(result.success).toBe(false)
  })

  it('rechaza venta sin items', () => {
    const saleData = { ...validSaleData, items: [] }
    const result = saleSchema.safeParse(saleData)
    expect(result.success).toBe(false)
  })

  it('rechaza total negativo', () => {
    const saleData = { ...validSaleData, total: -100 }
    const result = saleSchema.safeParse(saleData)
    expect(result.success).toBe(false)
  })

  it('acepta customer_id como UUID válido', () => {
    const saleData = {
      ...validSaleData,
      customer_id: '550e8400-e29b-41d4-a716-446655440000',
    }
    const result = saleSchema.safeParse(saleData)
    expect(result.success).toBe(true)
  })

  it('rechaza customer_id como UUID inválido', () => {
    const saleData = {
      ...validSaleData,
      customer_id: 'not-a-uuid',
    }
    const result = saleSchema.safeParse(saleData)
    expect(result.success).toBe(false)
  })

  it('aplica discount_amount por defecto como 0', () => {
    const saleData = { ...validSaleData }
    delete (saleData as { discount_amount?: number }).discount_amount

    const result = saleSchema.safeParse(saleData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.discount_amount).toBe(0)
    }
  })
})
