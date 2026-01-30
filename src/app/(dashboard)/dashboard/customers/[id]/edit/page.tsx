import { notFound } from 'next/navigation'
import { CustomerForm } from '@/features/customers/components/customer-form'
import { getCustomer, updateCustomer } from '@/features/customers/actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCustomerPage({ params }: PageProps) {
  const { id } = await params
  const { data: customer } = await getCustomer(id)

  if (!customer) {
    notFound()
  }

  const updateCustomerWithId = updateCustomer.bind(null, id)

  return (
    <div className="max-w-2xl">
      <CustomerForm customer={customer} action={updateCustomerWithId} />
    </div>
  )
}
