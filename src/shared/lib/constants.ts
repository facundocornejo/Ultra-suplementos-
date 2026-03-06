// Métodos de pago disponibles
export const PAYMENT_METHODS = {
  CASH: 'cash',
  DEBIT: 'debit',
  CREDIT: 'credit',
  TRANSFER: 'transfer',
  MERCADOPAGO: 'mercadopago',
} as const

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  debit: 'Débito',
  credit: 'Crédito',
  transfer: 'Transferencia',
  mercadopago: 'Mercado Pago',
}

// Tipos de movimientos de stock
export const STOCK_MOVEMENT_TYPES = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  ADJUSTMENT: 'adjustment',
  RETURN: 'return',
} as const

export const STOCK_MOVEMENT_LABELS: Record<string, string> = {
  purchase: 'Compra',
  sale: 'Venta',
  adjustment: 'Ajuste',
  return: 'Devolución',
}

// Estados de sesión de caja
export const CASH_SESSION_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
} as const

// Tipos de movimientos de caja
export const CASH_MOVEMENT_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
} as const

export const CASH_MOVEMENT_LABELS: Record<string, string> = {
  deposit: 'Depósito',
  withdrawal: 'Retiro',
}

// Roles de usuario
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
} as const

export const USER_ROLE_LABELS: Record<string, string> = {
  owner: 'Dueño',
  admin: 'Administrador',
  employee: 'Empleado',
}

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/dashboard/products',
  CATEGORIES: '/dashboard/categories',
  SALES: '/dashboard/sales',
  CASH: '/dashboard/cash',
  CUSTOMERS: '/dashboard/customers',
  SUPPLIERS: '/dashboard/suppliers',
  STOCK: '/dashboard/stock',
  REPORTS: '/dashboard/reports',
} as const

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const

// Configuración de alertas
export const ALERTS = {
  LOW_STOCK_THRESHOLD: 5,
  EXPIRATION_WARNING_MONTHS: 3,
  EXPIRATION_CRITICAL_DAYS: 30,
} as const
