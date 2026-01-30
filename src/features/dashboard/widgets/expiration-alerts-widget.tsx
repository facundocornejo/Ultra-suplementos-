import { getExpiringProducts } from '../actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatDate } from '@/shared/lib/formatters'

export async function ExpirationAlertsWidget() {
  const result = await getExpiringProducts()

  if (result.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximos a Vencer</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>Error al cargar productos próximos a vencer</AlertDescription>
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
          <CardTitle>Próximos a Vencer</CardTitle>
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
                No hay productos próximos a vencer
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getDaysUntilExpiration = (expirationDate: string) => {
    const today = new Date()
    const expiration = new Date(expirationDate)
    const diffTime = expiration.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getExpirationBadge = (days: number) => {
    if (days < 0) {
      return <Badge variant="destructive">Vencido</Badge>
    }
    if (days <= 30) {
      return <Badge variant="destructive">{days} días</Badge>
    }
    if (days <= 60) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">{days} días</Badge>
    }
    return <Badge variant="secondary">{days} días</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Próximos a Vencer</CardTitle>
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            {products.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.slice(0, 5).map((product) => {
            const days = product.expiration_date
              ? getDaysUntilExpiration(product.expiration_date)
              : null

            return (
              <Link
                key={product.id}
                href={`/dashboard/products/${product.id}`}
                className="block rounded-lg border border-orange-200 bg-orange-50 p-3 hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {product.categories.name}
                    </p>
                    {product.expiration_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        Vence: {formatDate(new Date(product.expiration_date))}
                      </p>
                    )}
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    {days !== null && getExpirationBadge(days)}
                  </div>
                </div>
              </Link>
            )
          })}

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
