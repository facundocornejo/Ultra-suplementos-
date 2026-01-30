import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getSuppliers } from '@/features/suppliers/actions'
import { SuppliersTable } from '@/features/suppliers/components/suppliers-table'
import { SupplierSearch } from '@/features/suppliers/components/supplier-search'

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>
}

export default async function SuppliersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const { data: suppliers, count } = await getSuppliers({
    search: params.search,
    page,
    limit: 20,
  })

  const totalPages = Math.ceil((count || 0) / 20)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-500">Gestiona tus proveedores y compras</p>
        </div>
        <Link href="/dashboard/suppliers/new">
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proveedor
          </Button>
        </Link>
      </div>

      <SupplierSearch />

      <SuppliersTable suppliers={suppliers || []} />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link href={`/dashboard/suppliers?page=${page - 1}${params.search ? `&search=${params.search}` : ''}`}>
              <Button variant="outline">Anterior</Button>
            </Link>
          )}
          <span className="flex items-center px-4 text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/dashboard/suppliers?page=${page + 1}${params.search ? `&search=${params.search}` : ''}`}>
              <Button variant="outline">Siguiente</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
