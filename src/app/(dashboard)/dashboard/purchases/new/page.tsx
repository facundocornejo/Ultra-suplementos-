import { PurchaseForm } from '@/features/purchases/components/purchase-form'
import { createServerActionClient } from '@/core/infrastructure/supabase/client'

export default async function NewPurchasePage() {
  const supabase = await createServerActionClient()

  const [suppliersResult, productsResult] = await Promise.all([
    supabase
      .from('suppliers')
      .select('id, business_name')
      .eq('is_active', true)
      .order('business_name'),
    supabase
      .from('products')
      .select('id, name, purchase_price, stock')
      .eq('is_active', true)
      .order('name'),
  ])

  const suppliers = suppliersResult.data || []
  const products = productsResult.data || []

  if (suppliers.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Compra</h1>
        <p className="text-gray-500">
          Necesitas tener al menos un proveedor registrado.{' '}
          <a href="/dashboard/suppliers/new" className="text-orange-600 hover:underline">
            Crear proveedor
          </a>
        </p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Compra</h1>
        <p className="text-gray-500">
          Necesitas tener al menos un producto registrado.{' '}
          <a href="/dashboard/products/new" className="text-orange-600 hover:underline">
            Crear producto
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Compra</h1>
        <p className="text-gray-500">Registra una compra de mercaderia a un proveedor</p>
      </div>
      <PurchaseForm suppliers={suppliers} products={products} />
    </div>
  )
}
