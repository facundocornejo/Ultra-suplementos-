import { notFound } from 'next/navigation'
import { CategoryForm } from '@/features/categories/components/category-form'
import { getCategory, updateCategory } from '@/features/categories/actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params
  const { data: category, error } = await getCategory(id)

  if (error || !category) {
    notFound()
  }

  const updateWithId = updateCategory.bind(null, id)

  return (
    <div className="max-w-2xl">
      <CategoryForm category={category} action={updateWithId} />
    </div>
  )
}
