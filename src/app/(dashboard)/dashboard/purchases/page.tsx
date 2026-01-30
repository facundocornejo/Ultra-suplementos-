import { getPurchases } from '@/features/purchases/actions'
import { PurchaseList } from '@/features/purchases/components/purchase-list'

export default async function PurchasesPage() {
  const { data: purchases, error } = await getPurchases()

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Compras</h1>
        <p className="text-red-600">Error al cargar las compras: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compras a Proveedores</h1>
        <p className="text-gray-500">Registra y gestiona las compras de mercaderia</p>
      </div>
      <PurchaseList purchases={purchases || []} />
    </div>
  )
}
