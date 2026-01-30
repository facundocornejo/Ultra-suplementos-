import { getProducts } from '@/features/products/actions'
import { POSScreen } from '@/features/sales/components/pos-screen'

export default async function SalesPage() {
  const productsResult = await getProducts()

  if (productsResult.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Punto de Venta</h1>
          <p className="text-gray-600 mt-2">
            Sistema POS para gestionar ventas
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">
            Error al cargar los productos: {productsResult.error}
          </p>
        </div>
      </div>
    )
  }

  const products = productsResult.data || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Punto de Venta</h1>
        <p className="text-gray-600 mt-2">
          Sistema POS para gestionar ventas
        </p>
      </div>

      <POSScreen products={products} />
    </div>
  )
}
