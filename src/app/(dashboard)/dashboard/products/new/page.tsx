import { getCategories } from '@/features/categories/actions'
import { getLocations } from '@/features/products/actions'
import { ProductForm } from '@/features/products/components/product-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewProductPage() {
  const [categoriesResult, locationsResult] = await Promise.all([
    getCategories(),
    getLocations(),
  ])

  if (categoriesResult.error || locationsResult.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Producto</h1>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">
            Error al cargar los datos necesarios: {categoriesResult.error || locationsResult.error}
          </p>
        </div>
        <Link href="/dashboard/products">
          <Button variant="outline">Volver a Productos</Button>
        </Link>
      </div>
    )
  }

  const categories = categoriesResult.data || []
  const locations = locationsResult.data || []

  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Producto</h1>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <p className="text-orange-800">
            No hay categorías disponibles. Por favor, crea al menos una categoría antes de agregar productos.
          </p>
        </div>
        <Link href="/dashboard/products">
          <Button variant="outline">Volver a Productos</Button>
        </Link>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Producto</h1>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <p className="text-orange-800">
            No hay ubicaciones disponibles. Por favor, crea al menos una ubicación antes de agregar productos.
          </p>
        </div>
        <Link href="/dashboard/products">
          <Button variant="outline">Volver a Productos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Producto</h1>
        <p className="text-gray-600 mt-2">
          Agrega un nuevo producto al inventario
        </p>
      </div>

      <ProductForm categories={categories} locations={locations} />
    </div>
  )
}
