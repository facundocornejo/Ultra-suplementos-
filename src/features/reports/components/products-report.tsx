import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/shared/lib/formatters'
import { Trophy } from 'lucide-react'

interface TopProduct {
  product_id: string
  product_name: string
  quantity: number
  revenue: number
}

interface ProductsReportProps {
  data: TopProduct[]
}

export function ProductsReport({ data }: ProductsReportProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">No hay ventas en el período seleccionado</p>
        </CardContent>
      </Card>
    )
  }

  const totalQuantity = data.reduce((sum, p) => sum + p.quantity, 0)
  const totalRevenue = data.reduce((sum, p) => sum + p.revenue, 0)

  return (
    <div className="space-y-6">
      {/* Top 3 destacados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.slice(0, 3).map((product, index) => (
          <Card key={product.product_id} className={index === 0 ? 'border-orange-500 border-2' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Trophy className={`h-5 w-5 ${
                  index === 0 ? 'text-yellow-500' :
                  index === 1 ? 'text-gray-400' :
                  'text-orange-600'
                }`} />
                <span className="text-sm text-gray-500">#{index + 1} Más vendido</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-lg truncate" title={product.product_name}>
                {product.product_name}
              </p>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-500">{product.quantity} unidades</span>
                <span className="font-medium">{formatCurrency(product.revenue)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla completa */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">% del Total</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((product, index) => {
                const quantityPercent = totalQuantity > 0
                  ? ((product.quantity / totalQuantity) * 100).toFixed(1)
                  : '0'

                return (
                  <TableRow key={product.product_id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{product.product_name}</TableCell>
                    <TableCell className="text-right">{product.quantity}</TableCell>
                    <TableCell className="text-right">{quantityPercent}%</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(product.revenue)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Totales */}
          <div className="mt-4 pt-4 border-t flex justify-between">
            <span className="font-medium">Total</span>
            <div className="text-right">
              <p className="text-sm text-gray-500">{totalQuantity} unidades</p>
              <p className="font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
