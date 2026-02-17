import {
  getProduct,
  getCategories,
  getLocations,
} from '@/features/products/actions'
import { ProductForm } from '@/features/products/components/product-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [productResult, categoriesResult, locationsResult] = await Promise.all([
    getProduct(id),
    getCategories(),
    getLocations(),
  ])

  if (productResult.error) {
    if (productResult.error.includes('not found')) {
      notFound()
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">
            Error al cargar el producto: {productResult.error}
          </p>
        </div>
        <Link href="/dashboard/products">
          <Button variant="outline">Volver a Productos</Button>
        </Link>
      </div>
    )
  }

  if (categoriesResult.error || locationsResult.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
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

  const product = productResult.data
  const categories = categoriesResult.data || []
  const locations = locationsResult.data || []

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
        <p className="text-gray-600 mt-2">
          Modifica la información del producto
        </p>
      </div>

      <ProductForm
        categories={categories}
        locations={locations}
        product={product}
      />
    </div>
  )
}
