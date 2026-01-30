import { signOut, getUser } from '@/features/auth/actions'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Toaster } from '@/components/ui/sonner'
import { SessionIndicator } from '@/features/cash-sessions/components/session-indicator'
import { ChatWidget } from '@/features/ai/components'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Image
                src="/logo.png"
                alt="Ultra"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Ultra Suplementos
                </h1>
                <p className="text-xs text-gray-500">Sistema de Gestión</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <SessionIndicator />
              <span className="text-sm text-gray-700">{user.email}</span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Salir
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-900 bg-orange-50 border border-orange-200"
            >
              <span>📊</span>
              Dashboard
            </Link>
            <Link
              href="/dashboard/products"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>📦</span>
              Productos
            </Link>
            <Link
              href="/dashboard/sales"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>💰</span>
              Ventas / POS
            </Link>
            <Link
              href="/dashboard/cash"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>💵</span>
              Caja
            </Link>
            <Link
              href="/dashboard/customers"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>👥</span>
              Clientes
            </Link>
            <Link
              href="/dashboard/suppliers"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>🏢</span>
              Proveedores
            </Link>
            <Link
              href="/dashboard/purchases"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>🛒</span>
              Compras
            </Link>
            <Link
              href="/dashboard/stock"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>📊</span>
              Stock
            </Link>
            <Link
              href="/dashboard/reports"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>📈</span>
              Reportes
            </Link>
            <Link
              href="/dashboard/marketing"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>✨</span>
              Marketing IA
            </Link>
          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
      <Toaster />
      <ChatWidget />
    </div>
  )
}
