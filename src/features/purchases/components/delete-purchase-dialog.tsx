'use client'

import { useTransition } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deletePurchase } from '../actions'
import { toast } from 'sonner'

interface DeletePurchaseDialogProps {
  purchase: { id: string; purchase_number: string }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeletePurchaseDialog({
  purchase,
  open,
  onOpenChange,
}: DeletePurchaseDialogProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePurchase(purchase.id)
      if (result.error) {
        toast.error('Error al eliminar la compra')
      } else {
        toast.success('Compra eliminada. Stock revertido.')
        onOpenChange(false)
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar compra</AlertDialogTitle>
          <AlertDialogDescription>
            Vas a eliminar la compra <strong>{purchase.purchase_number}</strong>.
            El stock de los productos se revertira automaticamente.
            Esta accion no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
