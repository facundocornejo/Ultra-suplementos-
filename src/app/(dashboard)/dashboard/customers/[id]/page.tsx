import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Pencil } from 'lucide-react'
import { getCustomer, getCustomerSales } from '@/features/customers/actions'
import { formatCurrency, formatDateTime, formatPhone } from '@/shared/lib/formatters'
import { PAYMENT_METHODS } from '@/shared/lib/constants'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params
  const [{ data: customer }, { data: sales }] = await Promise.all([
    getCustomer(id),
    getCustomerSales(id),
  ])

  if (!customer) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/customers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.full_name}</h1>
            <p className="text-gray-500">Detalle del cliente</p>
          </div>
        </div>
        <Link href={`/dashboard/customers/${id}/edit`}>
          <Button variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">DNI</p>
                <p className="font-medium">{customer.dni || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium">
                  {customer.phone ? formatPhone(customer.phone) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{customer.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ciudad</p>
                <p className="font-medium">{customer.city || '-'}</p>
              </div>
            </div>
            {customer.address && (
              <div>
                <p className="text-sm text-gray-500">Dirección</p>
                <p className="font-medium">{customer.address}</p>
              </div>
            )}
            {customer.notes && (
              <div>
                <p className="text-sm text-gray-500">Notas</p>
                <p className="font-medium">{customer.notes}</p>
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
            {sales && sales.length > 0 ? (
              <div className="space-y-3">
                {sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{sale.sale_number}</p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(new Date(sale.created_at))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(sale.total)}</p>
                      <p className="text-sm text-gray-500">
                        {PAYMENT_METHODS[sale.payment_method as keyof typeof PAYMENT_METHODS] || sale.payment_method}
                      </p>
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
