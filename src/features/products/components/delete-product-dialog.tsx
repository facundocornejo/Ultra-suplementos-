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
import { deleteProduct } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Product = {
  id: string
  name: string
}

interface DeleteProductDialogProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteProductDialog({
  product,
  open,
  onOpenChange,
}: DeleteProductDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deleteProduct(product.id)

      if (result.error) {
        toast.error('Error al eliminar el producto: ' + result.error)
        return
      }

      toast.success('Producto eliminado correctamente')
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error('Error al eliminar el producto')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar producto?</DialogTitle>
          <DialogDescription>
            ¿Estás seguro que deseas eliminar el producto &quot;{product.name}&quot;?
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
