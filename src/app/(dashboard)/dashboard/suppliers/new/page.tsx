import { SupplierForm } from '@/features/suppliers/components/supplier-form'
import { createSupplier } from '@/features/suppliers/actions'

export default function NewSupplierPage() {
  return (
    <div className="max-w-2xl">
      <SupplierForm action={createSupplier} />
    </div>
  )
}
