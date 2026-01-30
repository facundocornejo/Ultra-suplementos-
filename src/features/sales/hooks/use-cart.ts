'use client'

import { useState, useCallback } from 'react'

export type CartItem = {
  productId: string
  name: string
  sku?: string | null
  price: number
  quantity: number
  stock: number
  imageUrl?: string | null
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.productId === product.productId)

      if (existingItem) {
        // Verificar que no exceda el stock
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.stock) {
          return currentItems
        }

        return currentItems.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      }

      // Verificar stock al agregar nuevo item
      if (quantity > product.stock) {
        return currentItems
      }

      return [...currentItems, { ...product, quantity }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.productId === productId) {
          // Verificar que no exceda el stock
          const newQuantity = Math.min(quantity, item.stock)
          return { ...item, quantity: newQuantity }
        }
        return item
      })
    )
  }, [removeItem])

  const clear = useCallback(() => {
    setItems([])
  }, [])

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    subtotal,
    itemCount,
  }
}
