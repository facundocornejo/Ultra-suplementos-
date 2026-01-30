'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { SocialMediaGenerator } from './SocialMediaGenerator'

type Product = {
  id: string
  name: string
  brand: string | null
  price: number
  categoryName: string | null
}

type Props = {
  products: Product[]
}

export function MarketingGeneratorSection({ products }: Props) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    products[0]?.id ?? null
  )

  const selectedProduct = products.find((p) => p.id === selectedProductId)

  if (!selectedProduct) {
    return (
      <div className="bg-gray-50 rounded-lg border border-dashed p-8 text-center text-gray-500">
        <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Seleccioná un producto para generar contenido</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Selector de producto */}
      <div className="bg-white rounded-lg border p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Producto seleccionado
        </label>
        <select
          value={selectedProductId ?? ''}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} - ${product.price.toLocaleString('es-AR')}
            </option>
          ))}
        </select>
      </div>

      {/* Generador */}
      <SocialMediaGenerator
        productId={selectedProduct.id}
        productName={selectedProduct.name}
      />
    </div>
  )
}
