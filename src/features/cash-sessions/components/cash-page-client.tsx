'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SessionOpenDialog } from './session-open-dialog'
import { SessionCloseDialog } from './session-close-dialog'
import { CashMovementDialog } from './cash-movement-dialog'
import { formatCurrency, formatDateTime } from '@/shared/lib/formatters'

type CashSession = {
  id: string
  opened_at: string
  opening_balance: number
  expected_balance: number
  closing_notes: string | null
}

type CashMovement = {
  id: string
  type: string
  amount: number
  reason: string
  created_at: string
}

type Sale = {
  id: string
  total: number
  payment_method: string
  created_at: string
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'Efectivo',
  debit: 'Débito',
  credit: 'Crédito',
  transfer: 'Transferencia',
  mercadopago: 'Mercado Pago',
}

interface CashPageClientProps {
  session: CashSession | null
  movements: CashMovement[]
  sales: Sale[]
}

export function CashPageClient({ session, movements, sales }: CashPageClientProps) {
  const [openDialogOpen, setOpenDialogOpen] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [movementDialogOpen, setMovementDialogOpen] = useState(false)

  if (!session) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Control de Caja</h1>
          <p className="text-gray-600 mt-2">
            Gestiona la apertura y cierre de caja
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
              <svg
                className="h-10 w-10 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No hay sesión de caja abierta
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Debes abrir la caja para comenzar a registrar ventas
            </p>
            <Button size="lg" onClick={() => setOpenDialogOpen(true)}>
              Abrir Caja
            </Button>
          </CardContent>
        </Card>

        <SessionOpenDialog
          open={openDialogOpen}
          onOpenChange={setOpenDialogOpen}
        />
      </div>
    )
  }

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
  const totalDeposits = movements
    .filter((m) => m.type === 'deposit')
    .reduce((sum, m) => sum + m.amount, 0)
  const totalWithdrawals = movements
    .filter((m) => m.type === 'withdrawal')
    .reduce((sum, m) => sum + m.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Control de Caja</h1>
          <p className="text-gray-600 mt-2">
            Gestiona la sesión de caja actual
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setMovementDialogOpen(true)}
          >
            Registrar Movimiento
          </Button>
          <Button variant="destructive" onClick={() => setCloseDialogOpen(true)}>
            Cerrar Caja
          </Button>
        </div>
      </div>

      {/* Resumen de la Sesión */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Saldo Inicial</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(session.opening_balance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Ventas</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              +{formatCurrency(totalSales)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{sales.length} ventas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Movimientos</p>
            <div className="flex gap-4 mt-1">
              <div>
                <p className="text-sm font-medium text-green-600">
                  +{formatCurrency(totalDeposits)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-red-600">
                  -{formatCurrency(totalWithdrawals)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Saldo Esperado</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {formatCurrency(session.expected_balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info de la Sesión */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Información de la Sesión</CardTitle>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Abierta
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Apertura:</span>
              <span className="font-medium">
                {formatDateTime(new Date(session.opened_at))}
              </span>
            </div>
            {session.closing_notes && (
              <div className="text-sm">
                <span className="text-gray-600">Notas de cierre:</span>
                <p className="mt-1 text-gray-700">{session.closing_notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ventas */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas de la Sesión ({sales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay ventas registradas en esta sesión
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono text-sm">
                      #{sale.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(new Date(sale.created_at))}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {paymentMethodLabels[sale.payment_method] ||
                          sale.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(sale.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Movimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos de Efectivo ({movements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay movimientos registrados en esta sesión
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <Badge
                        variant={
                          movement.type === 'deposit' ? 'default' : 'destructive'
                        }
                        className={
                          movement.type === 'deposit'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : ''
                        }
                      >
                        {movement.type === 'deposit' ? 'Depósito' : 'Retiro'}
                      </Badge>
                    </TableCell>
                    <TableCell>{movement.reason}</TableCell>
                    <TableCell>
                      {formatDateTime(new Date(movement.created_at))}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span
                        className={
                          movement.type === 'deposit'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {movement.type === 'deposit' ? '+' : '-'}
                        {formatCurrency(movement.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Diálogos */}
      <SessionCloseDialog
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        session={session}
      />

      <CashMovementDialog
        open={movementDialogOpen}
        onOpenChange={setMovementDialogOpen}
        sessionId={session.id}
      />
    </div>
  )
}
