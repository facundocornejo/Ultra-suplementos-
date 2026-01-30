import { getActiveSession, getCashMovements, getSessionSales } from '@/features/cash-sessions/actions'
import { CashPageClient } from '@/features/cash-sessions/components/cash-page-client'

export default async function CashPage() {
  const sessionResult = await getActiveSession()
  const session = sessionResult.data

  let movements = []
  let sales = []

  if (session) {
    const [movementsResult, salesResult] = await Promise.all([
      getCashMovements(session.id),
      getSessionSales(session.id),
    ])

    movements = movementsResult.data || []
    sales = salesResult.data || []
  }

  return <CashPageClient session={session} movements={movements} sales={sales} />
}
