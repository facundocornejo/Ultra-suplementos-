import { getProducts } from '@/features/products/actions'
import { getCategories } from '@/features/categories/actions'
import { ProductList } from '@/features/products/components/product-list'

export default async function ProductsPage() {
  const [productsResult, categoriesResult] = await Promise.all([
    getProducts(),
    getCategories(),
  ])

  if (productsResult.error || categoriesResult.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tu inventario de productos
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">
            Error al cargar los productos: {productsResult.error || categoriesResult.error}
          </p>
        </div>
      </div>
    )
  }

  const products = productsResult.data || []
  const categories = categoriesResult.data || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
        <p className="text-gray-600 mt-2">
          Gestiona tu inventario de productos
        </p>
      </div>

      <ProductList products={products} categories={categories} />
    </div>
  )
}
