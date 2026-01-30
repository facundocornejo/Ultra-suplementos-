import { getPurchase } from '@/features/purchases/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const paymentMethodLabels: Record<string, string> = {
  cash: 'Efectivo',
  debit: 'Debito',
  credit: 'Credito',
  transfer: 'Transferencia',
  mercadopago: 'Mercado Pago',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PurchaseDetailPage({ params }: PageProps) {
  const { id } = await params
  const { data: purchase, error } = await getPurchase(id)

  if (error || !purchase) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Compra no encontrada</h1>
        <Link href="/dashboard/purchases">
          <Button variant="outline">Volver a compras</Button>
        </Link>
      </div>
    )
  }

  const total = purchase.purchase_items?.reduce(
    (sum: number, item: { subtotal: number }) => sum + item.subtotal,
    0
  ) || purchase.total

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Compra {purchase.purchase_number}
          </h1>
          <p className="text-gray-500">
            {formatDate(new Date(purchase.purchase_date))}
          </p>
        </div>
        <Link href="/dashboard/purchases">
          <Button variant="outline">Volver</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Info de la compra */}
        <Card>
          <CardHeader>
            <CardTitle>Informacion General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Proveedor</span>
              <span className="font-medium">{purchase.suppliers?.business_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contacto</span>
              <span>{purchase.suppliers?.contact_name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Metodo de pago</span>
              <Badge variant="outline">
                {paymentMethodLabels[purchase.payment_method] || purchase.payment_method}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estado</span>
              {purchase.payment_status === 'paid' ? (
                <Badge className="bg-green-100 text-green-800">Pagado</Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
              )}
            </div>
            {purchase.notes && (
              <div>
                <span className="text-gray-600 block mb-1">Notas</span>
                <p className="text-sm bg-gray-50 p-2 rounded">{purchase.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Productos</span>
              <span>{purchase.purchase_items?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Unidades totales</span>
              <span>
                {purchase.purchase_items?.reduce(
                  (sum: number, item: { quantity: number }) => sum + item.quantity,
                  0
                ) || 0}
              </span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-lg text-orange-600">
                {formatCurrency(total)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Costo Unitario</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchase.purchase_items?.map((item: {
                  id: string
                  quantity: number
                  unit_cost: number
                  subtotal: number
                  expiration_date: string | null
                  products: { id: string; name: string }
                }) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/products/${item.products.id}`}
                        className="text-orange-600 hover:underline"
                      >
                        {item.products.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unit_cost)}</TableCell>
                    <TableCell>
                      {item.expiration_date
                        ? formatDate(new Date(item.expiration_date))
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.subtotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
