import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DateRangePicker } from '@/features/reports/components/date-range-picker'
import { SalesReport } from '@/features/reports/components/sales-report'
import { ProductsReport } from '@/features/reports/components/products-report'
import { StockReport } from '@/features/reports/components/stock-report'
import { ProfitReport } from '@/features/reports/components/profit-report'
import {
  getSalesSummary,
  getTopProducts,
  getStockReport,
  getProfitReport,
} from '@/features/reports/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string; tab?: string }>
}

function LoadingSpinner() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </CardContent>
    </Card>
  )
}

async function SalesReportSection({ from, to }: { from: string; to: string }) {
  const { data } = await getSalesSummary({ from, to })
  if (!data) return <p className="text-gray-500">Error al cargar datos</p>
  return <SalesReport data={data} />
}

async function ProductsReportSection({ from, to }: { from: string; to: string }) {
  const { data } = await getTopProducts({ from, to }, 20)
  if (!data) return <p className="text-gray-500">Error al cargar datos</p>
  return <ProductsReport data={data} />
}

async function StockReportSection() {
  const { data } = await getStockReport()
  if (!data) return <p className="text-gray-500">Error al cargar datos</p>
  return <StockReport data={data} />
}

async function ProfitReportSection({ from, to }: { from: string; to: string }) {
  const { data } = await getProfitReport({ from, to })
  if (!data) return <p className="text-gray-500">Error al cargar datos</p>
  return <ProfitReport data={data} />
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const params = await searchParams

  // Default: último mes
  const today = new Date()
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  const from = params.from || oneMonthAgo.toISOString().split('T')[0]
  const to = params.to || today.toISOString().split('T')[0]
  const activeTab = params.tab || 'sales'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-500">Analiza el rendimiento de tu negocio</p>
      </div>

      <DateRangePicker />

      <Tabs defaultValue={activeTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="stock">Inventario</TabsTrigger>
          <TabsTrigger value="profit">Rentabilidad</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Suspense fallback={<LoadingSpinner />}>
            <SalesReportSection from={from} to={to} />
          </Suspense>
        </TabsContent>

        <TabsContent value="products">
          <Suspense fallback={<LoadingSpinner />}>
            <ProductsReportSection from={from} to={to} />
          </Suspense>
        </TabsContent>

        <TabsContent value="stock">
          <Suspense fallback={<LoadingSpinner />}>
            <StockReportSection />
          </Suspense>
        </TabsContent>

        <TabsContent value="profit">
          <Suspense fallback={<LoadingSpinner />}>
            <ProfitReportSection from={from} to={to} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
