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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { addCashMovement } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'

type MovementType = 'deposit' | 'withdrawal'

interface CashMovementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
}

export function CashMovementDialog({
  open,
  onOpenChange,
  sessionId,
}: CashMovementDialogProps) {
  const [type, setType] = useState<MovementType>('deposit')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)
    setError(null)

    const formData = new FormData()
    formData.append('type', type)
    formData.append('amount', amount)
    formData.append('reason', reason)

    try {
      const result = await addCashMovement(sessionId, formData)

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      toast.success(
        type === 'deposit' ? 'Depósito registrado' : 'Retiro registrado'
      )
      setAmount('')
      setReason('')
      onOpenChange(false)
      router.refresh()
    } catch {
      setError('Error al registrar el movimiento')
      toast.error('Error al registrar el movimiento')
    } finally {
      setIsAdding(false)
    }
  }

  const handleReset = () => {
    setAmount('')
    setReason('')
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar Movimiento de Caja</DialogTitle>
            <DialogDescription>
              Registra depósitos o retiros de efectivo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Selector de Tipo */}
            <div className="space-y-3">
              <Label>Tipo de Movimiento</Label>
              <div className="grid grid-cols-2 gap-3">
                <Card
                  className={`cursor-pointer p-4 transition-all ${
                    type === 'deposit'
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => {
                    setType('deposit')
                    handleReset()
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="font-medium">Depósito</p>
                      <p className="text-xs text-gray-500">Ingreso de dinero</p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`cursor-pointer p-4 transition-all ${
                    type === 'withdrawal'
                      ? 'border-red-500 bg-red-50 ring-2 ring-red-500'
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => {
                    setType('withdrawal')
                    handleReset()
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💸</span>
                    <div>
                      <p className="font-medium">Retiro</p>
                      <p className="text-xs text-gray-500">Egreso de dinero</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Monto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">
                Motivo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="reason"
                placeholder={
                  type === 'deposit'
                    ? 'Ej: Depósito bancario'
                    : 'Ej: Pago a proveedor'
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
              <p className="text-sm text-gray-500">
                Describe brevemente el motivo del {type === 'deposit' ? 'depósito' : 'retiro'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isAdding}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isAdding || !amount || !reason}
              className={
                type === 'deposit'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {isAdding ? 'Registrando...' : type === 'deposit' ? 'Registrar Depósito' : 'Registrar Retiro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
