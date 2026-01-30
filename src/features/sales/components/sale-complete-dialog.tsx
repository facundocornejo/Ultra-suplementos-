'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/shared/lib/formatters'
import Link from 'next/link'

interface SaleCompleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  saleId: string
  total: number
  onNewSale: () => void
}

export function SaleCompleteDialog({
  open,
  onOpenChange,
  saleId,
  total,
  onNewSale,
}: SaleCompleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <DialogTitle className="text-center text-2xl">
            Venta Completada
          </DialogTitle>
          <DialogDescription className="text-center">
            La venta se registró correctamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total de la venta</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {formatCurrency(total)}
              </p>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            Venta #{saleId.slice(0, 8)}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Link href={`/api/receipts/${saleId}`} target="_blank" className="w-full">
            <Button variant="outline" className="w-full">
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Ver Comprobante
            </Button>
          </Link>
          <Button onClick={onNewSale} className="w-full">
            Nueva Venta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
