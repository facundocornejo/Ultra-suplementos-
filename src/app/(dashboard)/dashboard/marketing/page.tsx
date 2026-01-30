import { createServerActionClient } from '@/core/infrastructure/supabase/client'
import { MarketingGeneratorSection } from '@/features/ai/components'
import { Sparkles, Package } from 'lucide-react'

export default async function MarketingPage() {
  const supabase = await createServerActionClient()

  // Obtener productos activos para el selector
  const { data: products } = await supabase
    .from('products')
    .select('id, name, brand, price, category:categories(name)')
    .eq('is_active', true)
    .order('name')

  // Transformar productos para el componente cliente
  const transformedProducts =
    products?.map((product) => {
      // El join puede retornar un objeto o array dependiendo de la relación
      const categoryData = product.category as unknown
      const category =
        Array.isArray(categoryData)
          ? (categoryData[0] as { name: string } | undefined)
          : (categoryData as { name: string } | null)
      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        categoryName: category?.name ?? null,
      }
    }) ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-[#FF6B35]" />
          Marketing IA
        </h1>
        <p className="text-gray-500 mt-1">
          Generá contenido para redes sociales de tus productos usando
          inteligencia artificial
        </p>
      </div>

      {/* Contenido principal */}
      {transformedProducts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de productos */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos disponibles ({transformedProducts.length})
            </h2>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {transformedProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 border rounded-lg hover:border-[#FF6B35] hover:bg-orange-50/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {product.brand && <span>{product.brand} · </span>}
                        {product.categoryName ?? 'Sin categoría'}
                      </p>
                    </div>
                    <span className="font-semibold text-[#FF6B35]">
                      ${product.price.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generador */}
          <div className="lg:sticky lg:top-24">
            <MarketingGeneratorSection products={transformedProducts} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-8 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            No hay productos disponibles
          </h2>
          <p className="text-gray-500 mb-4">
            Agregá productos a tu inventario para poder generar contenido de
            marketing
          </p>
          <a
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors"
          >
            Agregar producto
          </a>
        </div>
      )}
    </div>
  )
}
