'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/products', label: 'Productos', icon: '📦' },
  { href: '/dashboard/categories', label: 'Categorias', icon: '🏷️' },
  { href: '/dashboard/sales', label: 'Ventas / POS', icon: '💰' },
  { href: '/dashboard/cash', label: 'Caja', icon: '💵' },
  { href: '/dashboard/customers', label: 'Clientes', icon: '👥' },
  { href: '/dashboard/suppliers', label: 'Proveedores', icon: '🏢' },
  { href: '/dashboard/purchases', label: 'Compras', icon: '🛒' },
  { href: '/dashboard/stock', label: 'Stock', icon: '📊' },
  { href: '/dashboard/reports', label: 'Reportes', icon: '📈' },
  { href: '/dashboard/marketing', label: 'Marketing IA', icon: '✨' },
  { href: '/dashboard/settings', label: 'Configuración', icon: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className={cn(
              'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive(item.href)
                ? 'text-gray-900 bg-orange-50 border border-orange-200'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
