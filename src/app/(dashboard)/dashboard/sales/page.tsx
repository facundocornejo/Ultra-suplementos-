import { getProducts } from '@/features/products/actions'
import { getPaymentSurcharges } from '@/features/settings/actions'
import { DEFAULT_SURCHARGES } from '@/features/settings/schemas/settings-schema'
import { POSScreen } from '@/features/sales/components/pos-screen'

export default async function SalesPage() {
  const [productsResult, surchargesResult] = await Promise.all([
    getProducts(),
    getPaymentSurcharges(),
  ])

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
  const surcharges = surchargesResult.data || DEFAULT_SURCHARGES

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Punto de Venta</h1>
        <p className="text-gray-600 mt-2">
          Sistema POS para gestionar ventas
        </p>
      </div>

      <POSScreen products={products} surcharges={surcharges} />
    </div>
  )
}
