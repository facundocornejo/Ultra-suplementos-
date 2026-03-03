import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/shared/lib/formatters'
import { AlertTriangle, Package, TrendingDown, Calendar } from 'lucide-react'

interface StockData {
  lowStock: Array<{
    id: string
    name: string
    stock: number
    min_stock: number
    sale_price: number
  }>
  expiringSoon: Array<{
    id: string
    name: string
    stock: number
    expiration_date: string
    sale_price: number
  }>
  inventoryValue: {
    costValue: number
    saleValue: number
    totalProducts: number
    totalUnits: number
  }
}

interface StockReportProps {
  data: StockData
}

// Helper para calcular días hasta vencimiento (fuera del componente para evitar warning de pureza)
function calculateExpiringProducts(products: StockData['expiringSoon']) {
  const now = Date.now()
  return products.slice(0, 10).map((product) => {
    const daysUntil = Math.ceil(
      (new Date(product.expiration_date).getTime() - now) / (1000 * 60 * 60 * 24)
    )
    return {
      ...product,
      daysUntil,
      isExpired: daysUntil < 0,
      isUrgent: daysUntil <= 30,
    }
  })
}

export function StockReport({ data }: StockReportProps) {
  const potentialProfit = data.inventoryValue.saleValue - data.inventoryValue.costValue
  const expiringWithDays = calculateExpiringProducts(data.expiringSoon)

  return (
    <div className="space-y-6">
      {/* Resumen del inventario */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Productos Activos
            </CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.inventoryValue.totalProducts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Unidades en Stock
            </CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.inventoryValue.totalUnits}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Valor (Costo)
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(data.inventoryValue.costValue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Valor (Venta)
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(data.inventoryValue.saleValue)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Ganancia potencial: {formatCurrency(potentialProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock bajo */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle>Stock Bajo ({data.lowStock.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {data.lowStock.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay productos con stock bajo
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Mínimo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.lowStock.slice(0, 10).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium truncate max-w-[200px]">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={product.stock === 0 ? 'destructive' : 'secondary'}>
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-gray-500">
                        {product.min_stock}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Próximos a vencer */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-500" />
              <CardTitle>Próximos a Vencer ({data.expiringSoon.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {data.expiringSoon.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay productos próximos a vencer
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Vence</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiringWithDays.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium truncate max-w-[200px]">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={product.isExpired ? 'destructive' : product.isUrgent ? 'secondary' : 'outline'}>
                          {product.isExpired
                            ? 'Vencido'
                            : `${product.daysUntil} días`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {product.stock}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
