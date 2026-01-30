import { redirect } from 'next/navigation'

// Redirige a reportes con la pestaña de inventario
export default function StockPage() {
  redirect('/dashboard/reports?tab=stock')
}
