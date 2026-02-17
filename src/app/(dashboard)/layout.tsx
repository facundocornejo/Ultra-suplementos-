import { signOut, getUser } from '@/features/auth/actions'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Toaster } from '@/components/ui/sonner'
import { SessionIndicator } from '@/features/cash-sessions/components/session-indicator'
import { Sidebar } from '@/shared/components/sidebar'

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
        <Sidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
      <Toaster />
      {/* IA deshabilitada temporalmente - API quota agotada */}
      {/* <ChatWidget /> */}
    </div>
  )
}
