import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getCategories } from '@/features/categories/actions'
import { CategoriesTable } from '@/features/categories/components/categories-table'

export default async function CategoriesPage() {
  const { data: categories } = await getCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-500">Gestiona las categorias de productos</p>
        </div>
        <Link href="/dashboard/categories/new">
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoria
          </Button>
        </Link>
      </div>

      <CategoriesTable categories={categories || []} />
    </div>
  )
}
