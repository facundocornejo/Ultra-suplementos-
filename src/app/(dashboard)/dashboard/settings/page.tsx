import { getPaymentSurcharges } from '@/features/settings/actions'
import { DEFAULT_SURCHARGES } from '@/features/settings/schemas/settings-schema'
import { SurchargesForm } from '@/features/settings/components/surcharges-form'

export default async function SettingsPage() {
  const result = await getPaymentSurcharges()
  const surcharges = result.data || DEFAULT_SURCHARGES

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-2">
          Ajustes del sistema de ventas
        </p>
      </div>

      <SurchargesForm initialData={surcharges} />
    </div>
  )
}
