import { CustomerForm } from '@/features/customers/components/customer-form'
import { createCustomer } from '@/features/customers/actions'

export default function NewCustomerPage() {
  return (
    <div className="max-w-2xl">
      <CustomerForm action={createCustomer} />
    </div>
  )
}
