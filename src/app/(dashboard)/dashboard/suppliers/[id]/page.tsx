import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Pencil } from 'lucide-react'
import { getSupplier, getSupplierPurchases } from '@/features/suppliers/actions'
import { formatCurrency, formatDate, formatCUIT, formatPhone } from '@/shared/lib/formatters'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SupplierDetailPage({ params }: PageProps) {
  const { id } = await params
  const [{ data: supplier }, { data: purchases }] = await Promise.all([
    getSupplier(id),
    getSupplierPurchases(id),
  ])

  if (!supplier) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/suppliers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{supplier.business_name}</h1>
            <p className="text-gray-500">Detalle del proveedor</p>
          </div>
        </div>
        <Link href={`/dashboard/suppliers/${id}/edit`}>
          <Button variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del proveedor */}
        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">CUIT</p>
                <p className="font-medium">
                  {supplier.cuit ? formatCUIT(supplier.cuit) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contacto</p>
                <p className="font-medium">{supplier.contact_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium">
                  {supplier.phone ? formatPhone(supplier.phone) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{supplier.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ciudad</p>
                <p className="font-medium">{supplier.city || '-'}</p>
              </div>
            </div>
            {supplier.address && (
              <div>
                <p className="text-sm text-gray-500">Dirección</p>
                <p className="font-medium">{supplier.address}</p>
              </div>
            )}
            {supplier.notes && (
              <div>
                <p className="text-sm text-gray-500">Notas</p>
                <p className="font-medium">{supplier.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historial de compras */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Compras</CardTitle>
          </CardHeader>
          <CardContent>
            {purchases && purchases.length > 0 ? (
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{purchase.purchase_number}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(new Date(purchase.purchase_date))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(purchase.total)}</p>
                      <Badge
                        variant={purchase.payment_status === 'paid' ? 'default' : 'secondary'}
                      >
                        {purchase.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Sin compras registradas
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
