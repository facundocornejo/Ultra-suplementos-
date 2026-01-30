import { getActiveSession } from '../actions'
import { getTodaySales } from '@/features/sales/actions'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/shared/lib/formatters'

export async function SessionIndicator() {
  const sessionResult = await getActiveSession()
  const salesResult = await getTodaySales()

  const session = sessionResult.data
  const todaySales = salesResult.total || 0

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="destructive" className="text-xs">
          Caja Cerrada
        </Badge>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
          Caja Abierta
        </Badge>
      </div>
      <div className="text-sm text-gray-600">
        <span className="font-medium">Ventas Hoy:</span>{' '}
        <span className="font-bold text-orange-600">{formatCurrency(todaySales)}</span>
      </div>
    </div>
  )
}
