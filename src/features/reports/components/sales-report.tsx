import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/shared/lib/formatters'
import { PAYMENT_METHOD_LABELS } from '@/shared/lib/constants'
import { TrendingUp, CreditCard, DollarSign, ShoppingCart } from 'lucide-react'

interface SalesSummary {
  totalSales: number
  totalRevenue: number
  byPaymentMethod: {
    cash: number
    debit: number
    credit: number
    transfer: number
    mercadopago: number
  }
  dailySales: Record<string, { count: number; total: number }>
}

interface SalesReportProps {
  data: SalesSummary
}

export function SalesReport({ data }: SalesReportProps) {
  const avgTicket = data.totalSales > 0 ? data.totalRevenue / data.totalSales : 0

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Ventas Totales
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalSales}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Ingresos
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Ticket Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(avgTicket)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Efectivo
            </CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(data.byPaymentMethod.cash)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Por método de pago */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas por Método de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.byPaymentMethod).map(([method, amount]) => {
              const percentage = data.totalRevenue > 0
                ? (amount / data.totalRevenue) * 100
                : 0

              return (
                <div key={method} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{PAYMENT_METHOD_LABELS[method] || method}</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ventas diarias */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas por Día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Object.entries(data.dailySales)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([date, stats]) => (
                <div
                  key={date}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(date + 'T12:00:00').toLocaleDateString('es-AR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    <p className="text-sm text-gray-500">{stats.count} ventas</p>
                  </div>
                  <p className="font-bold">{formatCurrency(stats.total)}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
