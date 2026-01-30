import { getLowStockProducts } from '../actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

export async function LowStockWidget() {
  const result = await getLowStockProducts()

  if (result.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Bajo</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>Error al cargar productos con stock bajo</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const products = result.data || []

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Bajo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <div className="mb-3 flex justify-center">
                <svg
                  className="h-12 w-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                Todos los productos tienen stock suficiente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Stock Bajo</CardTitle>
          <Badge variant="destructive">{products.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.slice(0, 5).map((product) => (
            <Link
              key={product.id}
              href={`/dashboard/products/${product.id}`}
              className="block rounded-lg border border-red-200 bg-red-50 p-3 hover:bg-red-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {product.categories.name}
                  </p>
                </div>
                <div className="ml-3 text-right flex-shrink-0">
                  <p className="font-bold text-red-600">
                    Stock: {product.stock}
                  </p>
                  <p className="text-xs text-gray-500">
                    Mín: {product.min_stock}
                  </p>
                </div>
              </div>
            </Link>
          ))}

          {products.length > 5 && (
            <Link href="/dashboard/products">
              <div className="text-center text-sm text-orange-600 hover:text-orange-700 font-medium pt-2">
                Ver todos ({products.length})
              </div>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
