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
import { openSession } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface SessionOpenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SessionOpenDialog({ open, onOpenChange }: SessionOpenDialogProps) {
  const [openingBalance, setOpeningBalance] = useState('')
  const [isOpening, setIsOpening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsOpening(true)
    setError(null)

    const formData = new FormData()
    formData.append('opening_balance', openingBalance)

    try {
      const result = await openSession(formData)

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      toast.success('Sesión de caja abierta correctamente')
      setOpeningBalance('')
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      setError('Error al abrir la sesión de caja')
      toast.error('Error al abrir la sesión de caja')
    } finally {
      setIsOpening(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Abrir Sesión de Caja</DialogTitle>
            <DialogDescription>
              Ingresa el saldo inicial con el que comienzas el día
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="opening_balance">
                Saldo Inicial <span className="text-red-500">*</span>
              </Label>
              <Input
                id="opening_balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                required
                autoFocus
              />
              <p className="text-sm text-gray-500">
                Ingresa el dinero en efectivo con el que comienzas
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isOpening}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isOpening || !openingBalance}>
              {isOpening ? 'Abriendo...' : 'Abrir Caja'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
