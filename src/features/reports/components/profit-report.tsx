import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/shared/lib/formatters'
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react'

interface ProfitData {
  totalRevenue: number
  totalCost: number
  grossProfit: number
  profitMargin: number
  salesCount: number
}

interface ProfitReportProps {
  data: ProfitData
}

export function ProfitReport({ data }: ProfitReportProps) {
  const isPositive = data.grossProfit >= 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Ingresos
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
            <p className="text-xs text-gray-500 mt-1">{data.salesCount} ventas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Costo de Ventas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(data.totalCost)}</p>
          </CardContent>
        </Card>

        <Card className={isPositive ? 'border-green-500 border-2' : 'border-red-500 border-2'}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Ganancia Bruta
            </CardTitle>
            <TrendingUp className={`h-4 w-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.grossProfit)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Margen de Ganancia
            </CardTitle>
            <Percent className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${data.profitMargin >= 20 ? 'text-green-600' : data.profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
              {data.profitMargin}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data.profitMargin >= 20 ? 'Excelente' : data.profitMargin >= 10 ? 'Aceptable' : 'Bajo'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalle visual */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose de Rentabilidad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Barra de ingresos vs costos */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ingresos</span>
                <span className="font-medium">{formatCurrency(data.totalRevenue)}</span>
              </div>
              <div className="h-8 bg-green-100 rounded-lg overflow-hidden relative">
                <div
                  className="absolute inset-y-0 left-0 bg-green-500 rounded-lg"
                  style={{ width: '100%' }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-white font-medium text-sm">
                  100%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Costo de Ventas</span>
                <span className="font-medium">{formatCurrency(data.totalCost)}</span>
              </div>
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                <div
                  className="absolute inset-y-0 left-0 bg-red-400 rounded-lg"
                  style={{ width: `${data.totalRevenue > 0 ? (data.totalCost / data.totalRevenue) * 100 : 0}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center font-medium text-sm">
                  {data.totalRevenue > 0 ? ((data.totalCost / data.totalRevenue) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ganancia</span>
                <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.grossProfit)}
                </span>
              </div>
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                <div
                  className={`absolute inset-y-0 left-0 rounded-lg ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.abs(data.profitMargin)}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center font-medium text-sm">
                  {data.profitMargin}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
