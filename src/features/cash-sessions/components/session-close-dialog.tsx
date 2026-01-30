'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { closeSession } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/shared/lib/formatters'

type CashSession = {
  id: string
  opening_balance: number
  expected_balance: number
}

interface SessionCloseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: CashSession
}

export function SessionCloseDialog({
  open,
  onOpenChange,
  session,
}: SessionCloseDialogProps) {
  const [actualBalance, setActualBalance] = useState('')
  const [closingNotes, setClosingNotes] = useState('')
  const [isClosing, setIsClosing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const calculateDifference = () => {
    if (!actualBalance) return 0
    return parseFloat(actualBalance) - session.expected_balance
  }

  const difference = calculateDifference()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsClosing(true)
    setError(null)

    const formData = new FormData()
    formData.append('actual_balance', actualBalance)
    formData.append('closing_notes', closingNotes)

    try {
      const result = await closeSession(session.id, formData)

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      if (difference !== 0) {
        toast.warning(`Sesión cerrada con diferencia de ${formatCurrency(Math.abs(difference))}`)
      } else {
        toast.success('Sesión de caja cerrada correctamente')
      }

      setActualBalance('')
      setClosingNotes('')
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      setError('Error al cerrar la sesión de caja')
      toast.error('Error al cerrar la sesión de caja')
    } finally {
      setIsClosing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Cerrar Sesión de Caja</DialogTitle>
            <DialogDescription>
              Cuenta el dinero en caja e ingresa el saldo real
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Resumen */}
            <div className="rounded-lg bg-gray-50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Saldo Inicial:</span>
                <span className="font-medium">
                  {formatCurrency(session.opening_balance)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Saldo Esperado:</span>
                <span className="font-medium">
                  {formatCurrency(session.expected_balance)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual_balance">
                Saldo Real <span className="text-red-500">*</span>
              </Label>
              <Input
                id="actual_balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={actualBalance}
                onChange={(e) => setActualBalance(e.target.value)}
                required
                autoFocus
              />
              <p className="text-sm text-gray-500">
                Cuenta el efectivo que hay en caja ahora
              </p>
            </div>

            {actualBalance && (
              <div
                className={`rounded-lg p-4 ${
                  difference === 0
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-orange-50 border border-orange-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`font-medium ${
                      difference === 0 ? 'text-green-900' : 'text-orange-900'
                    }`}
                  >
                    Diferencia:
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      difference === 0 ? 'text-green-600' : 'text-orange-600'
                    }`}
                  >
                    {difference > 0 ? '+' : ''}
                    {formatCurrency(difference)}
                  </span>
                </div>
                {difference !== 0 && (
                  <p className="text-sm text-orange-700 mt-2">
                    {difference > 0 ? 'Sobrante' : 'Faltante'} de caja
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="closing_notes">
                Notas {difference !== 0 && '(recomendado explicar la diferencia)'}
              </Label>
              <Textarea
                id="closing_notes"
                placeholder="Observaciones sobre el cierre..."
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isClosing}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isClosing || !actualBalance}>
              {isClosing ? 'Cerrando...' : 'Cerrar Caja'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
