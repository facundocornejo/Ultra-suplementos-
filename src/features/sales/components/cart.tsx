'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/shared/lib/formatters'
import Image from 'next/image'
import type { CartItem } from '../hooks/use-cart'

interface CartProps {
  items: CartItem[]
  subtotal: number
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onClear: () => void
}

export function Cart({
  items,
  subtotal,
  onUpdateQuantity,
  onRemoveItem,
  onClear,
}: CartProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-gray-400">
          <svg
            className="mx-auto h-16 w-16 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <p className="text-lg">El carrito está vacío</p>
          <p className="text-sm mt-1">Busca y agrega productos para comenzar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-lg font-semibold">
          Carrito ({items.reduce((sum, item) => sum + item.quantity, 0)} items)
        </h3>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Limpiar
        </Button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="space-y-2">
            <div className="flex gap-3">
              {item.imageUrl ? (
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded bg-gray-100 text-gray-400">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(item.price)} c/u
                </p>
                {item.stock <= 5 && (
                  <p className="text-xs text-orange-600 mt-1">
                    Stock bajo: {item.stock} disponibles
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="font-bold">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    if (!isNaN(value) && value > 0) {
                      onUpdateQuantity(item.productId, value)
                    }
                  }}
                  className="w-16 text-center"
                  min={1}
                  max={item.stock}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                >
                  +
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(item.productId)}
                className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            </div>

            <Separator />
          </div>
        ))}
      </div>

      {/* Totales */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-lg">
          <span className="font-medium">Subtotal:</span>
          <span className="font-bold">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-2xl">
          <span className="font-bold">Total:</span>
          <span className="font-bold text-orange-600">
            {formatCurrency(subtotal)}
          </span>
        </div>
      </div>
    </div>
  )
}
