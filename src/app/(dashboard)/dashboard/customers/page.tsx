import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getCustomers } from '@/features/customers/actions'
import { CustomersTable } from '@/features/customers/components/customers-table'
import { CustomerSearch } from '@/features/customers/components/customer-search'

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const { data: customers, count } = await getCustomers({
    search: params.search,
    page,
    limit: 20,
  })

  const totalPages = Math.ceil((count || 0) / 20)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500">Gestiona tu cartera de clientes</p>
        </div>
        <Link href="/dashboard/customers/new">
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </Link>
      </div>

      <CustomerSearch />

      <CustomersTable customers={customers || []} />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link href={`/dashboard/customers?page=${page - 1}${params.search ? `&search=${params.search}` : ''}`}>
              <Button variant="outline">Anterior</Button>
            </Link>
          )}
          <span className="flex items-center px-4 text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/dashboard/customers?page=${page + 1}${params.search ? `&search=${params.search}` : ''}`}>
              <Button variant="outline">Siguiente</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
