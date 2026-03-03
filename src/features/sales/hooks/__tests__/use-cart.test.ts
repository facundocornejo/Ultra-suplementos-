import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCart } from '../use-cart'

const mockProduct = {
  productId: 'prod-1',
  name: 'Proteína Whey',
  sku: 'SKU-001',
  price: 15000,
  stock: 10,
  imageUrl: null,
}

const mockProduct2 = {
  productId: 'prod-2',
  name: 'Creatina',
  sku: 'SKU-002',
  price: 8000,
  stock: 5,
  imageUrl: null,
}

describe('useCart', () => {
  describe('estado inicial', () => {
    it('comienza con carrito vacío', () => {
      const { result } = renderHook(() => useCart())

      expect(result.current.items).toEqual([])
      expect(result.current.subtotal).toBe(0)
      expect(result.current.itemCount).toBe(0)
    })
  })

  describe('addItem', () => {
    it('agrega un producto al carrito', () => {
      const { result } = renderHook(() => useCart())

      act(() => {
        result.current.addItem(mockProduct, 1)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].productId).toBe('prod-1')
      expect(result.current.items[0].quantity).toBe(1)
    })

    it('incrementa cantidad si producto ya existe', () => {
      const { result } = renderHook(() => useCart())

      act(() => {
        result.current.addItem(mockProduct, 1)
        result.current.addItem(mockProduct, 2)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].quantity).toBe(3)
    })

    it('no excede el stock disponible', () => {
      const { result } = renderHook(() => useCart())

      act(() => {
        result.current.addItem(mockProduct, 15) // stock es 10
      })

      // No debería agregar porque excede stock
      expect(result.current.items).toHaveLength(0)
    })

    it('no permite agregar más del stock al producto existente', () => {
      const { result } = renderHook(() => useCart())

      act(() => {
        result.current.addItem(mockProduct, 8)
        result.current.addItem(mockProduct, 5) // total sería 13, stock es 10
      })

      expect(result.current.items[0].quantity).toBe(8) // se mantiene en 8
    })
  })

  describe('removeItem', () => {
    it('elimina un producto del carrito', () => {
      const { result } = renderHook(() => useCart())

      act(() => {
        result.current.addItem(mockProduct, 1)
        result.current.addItem(mockProduct2, 1)
        result.current.removeItem('prod-1')
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].productId).toBe('prod-2')
    })

    it('no falla si el producto no existe', () => {
      const { result } = renderHook(() => useCart())

      act(() => {
        result.current.removeItem('producto-inexistente')
      })

      expect(result.current.items).toHaveLength(0)
    })
  })

  describe('updateQuantity', () => {
    it('actualiza la cantidad de un producto', () => {
      const { result } = renderHook(() => useCart())

      act(() => {
        result.current.addItem(mockProduct, 1)
        result.current.updateQuantity('prod-1', 5)
      })

      expect(result.current.items[0].quantity).toBe(5)
    })

    it('elimina el producto si cantidad es 0 o negativa', () => {
      const { result } = renderHook(() => useCart())

      act(() => {
        result.current.addItem(mockProduct, 3)
        result.current.updateQuantity('prod-1', 0)
      })

      expect(result.current.items).toHaveLength(0)
    })

    it('no excede el stock al actualizar', () => {
      const { result } = renderHook(() => useCart())

      act(() => {
        result.current.addItem(mockProduct, 1)
        result.current.updateQuantity('prod-1', 20) // stock es 10
      })

      expect(result.current.items[0].quantity).toBe(10) // limitado al stock
    })
  })

  describe('clear', () => {
    it('vacía el carrito', () => {
      const { result } = renderHook(() => useCart())

      act(() => {
        result.current.addItem(mockProduct, 2)
        result.current.addItem(mockProduct2, 1)
        result.current.clear()
      })

      expect(result.current.items).toHaveLength(0)
      expect(result.current.subtotal).toBe(0)
      expect(result.current.itemCount).toBe(0)
    })
  })

  describe('subtotal', () => {
    it('calcula subtotal correctamente', () => {
      const { result } = renderHook(() => useCart())

      act(() => {
        result.current.addItem(mockProduct, 2) // 15000 * 2 = 30000
        result.current.addItem(mockProduct2, 1) // 8000 * 1 = 8000
      })

      expect(result.current.subtotal).toBe(38000)
    })
  })

  describe('itemCount', () => {
    it('cuenta el total de items', () => {
      const { result } = renderHook(() => useCart())

      act(() => {
        result.current.addItem(mockProduct, 2)
        result.current.addItem(mockProduct2, 3)
      })

      expect(result.current.itemCount).toBe(5)
    })
  })
})
