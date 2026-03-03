'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { formatCurrency } from '@/shared/lib/formatters'

type Product = {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  sale_price: number
  stock: number
  image_url: string | null
  categories: {
    name: string
  } | null
}

// Helper para obtener el nombre de categoría de forma segura
function getCategoryName(categories: Product['categories']): string {
  if (!categories) return 'Sin categoría'
  if (Array.isArray(categories)) {
    return categories[0]?.name || 'Sin categoría'
  }
  return categories.name || 'Sin categoría'
}

interface ProductSearchProps {
  products: Product[]
  onProductSelect: (product: Product) => void
}

export function ProductSearch({ products, onProductSelect }: ProductSearchProps) {
  const [search, setSearch] = useState('')

  // Usar useMemo en lugar de useEffect + setState para evitar renders cascading
  const filteredProducts = useMemo(() => {
    if (search.trim() === '') return []

    const searchLower = search.toLowerCase()
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower) ||
          product.barcode?.toLowerCase().includes(searchLower) ||
          getCategoryName(product.categories).toLowerCase().includes(searchLower)
      )
      .slice(0, 10) // Mostrar máximo 10 resultados
  }, [search, products])

  const handleProductClick = (product: Product) => {
    if (product.stock <= 0) {
      return
    }
    onProductSelect(product)
    setSearch('') // Limpiar búsqueda limpia automáticamente filteredProducts via useMemo
  }

  return (
    <div className="space-y-2">
      <Input
        placeholder="Buscar producto por nombre, SKU o código de barras..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="text-lg"
        autoFocus
      />

      {filteredProducts.length > 0 && (
        <Card className="absolute z-10 w-full max-h-96 overflow-y-auto">
          <CardContent className="p-2">
            <div className="space-y-1">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  disabled={product.stock <= 0}
                  className={`w-full text-left p-3 rounded-md transition-colors ${
                    product.stock <= 0
                      ? 'bg-gray-50 cursor-not-allowed opacity-50'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-gray-200 text-gray-400">
                        <svg
                          className="h-6 w-6"
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
                      <p className="font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(product.categories)}
                        </Badge>
                        {product.sku && (
                          <span className="text-xs text-gray-500">
                            SKU: {product.sku}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(product.sale_price)}
                      </p>
                      <p className={`text-sm ${product.stock <= 5 ? 'text-orange-600' : 'text-gray-500'}`}>
                        Stock: {product.stock}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {search.trim() !== '' && filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-4 text-center text-gray-500">
            No se encontraron productos
          </CardContent>
        </Card>
      )}
    </div>
  )
}
