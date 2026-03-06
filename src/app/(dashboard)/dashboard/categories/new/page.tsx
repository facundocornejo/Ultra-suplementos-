import { CategoryForm } from '@/features/categories/components/category-form'
import { createCategory } from '@/features/categories/actions'

export default function NewCategoryPage() {
  return (
    <div className="max-w-2xl">
      <CategoryForm action={createCategory} />
    </div>
  )
}
