import { notFound } from 'next/navigation'
import { SupplierForm } from '@/features/suppliers/components/supplier-form'
import { getSupplier, updateSupplier } from '@/features/suppliers/actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditSupplierPage({ params }: PageProps) {
  const { id } = await params
  const { data: supplier } = await getSupplier(id)

  if (!supplier) {
    notFound()
  }

  const updateSupplierWithId = updateSupplier.bind(null, id)

  return (
    <div className="max-w-2xl">
      <SupplierForm supplier={supplier} action={updateSupplierWithId} />
    </div>
  )
}
