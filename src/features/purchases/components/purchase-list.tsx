'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import { DeletePurchaseDialog } from './delete-purchase-dialog'

type Purchase = {
  id: string
  purchase_number: string
  total: number
  payment_method: string
  payment_status: string
  notes: string | null
  purchase_date: string
  created_at: string
  suppliers: {
    id: string
    business_name: string
  }
  purchase_items: {
    id: string
    quantity: number
    subtotal: number
    products: {
      id: string
      name: string
    }
  }[]
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'Efectivo',
  debit: 'Debito',
  credit: 'Credito',
  transfer: 'Transferencia',
  mercadopago: 'Mercado Pago',
}

interface PurchaseListProps {
  purchases: Purchase[]
}

export function PurchaseList({ purchases }: PurchaseListProps) {
  const [search, setSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null)

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.purchase_number.toLowerCase().includes(search.toLowerCase()) ||
      purchase.suppliers.business_name.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const handleDeleteClick = (purchase: Purchase) => {
    setPurchaseToDelete(purchase)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por numero o proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link href="/dashboard/purchases/new">
          <Button>Nueva Compra</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numero</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[80px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  No se encontraron compras
                </TableCell>
              </TableRow>
            ) : (
              filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>
                    <span className="font-mono text-sm">{purchase.purchase_number}</span>
                  </TableCell>
                  <TableCell>
                    {formatDate(new Date(purchase.purchase_date))}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{purchase.suppliers.business_name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {purchase.purchase_items.length} {purchase.purchase_items.length === 1 ? 'producto' : 'productos'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {paymentMethodLabels[purchase.payment_method] || purchase.payment_method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {purchase.payment_status === 'paid' ? (
                      <Badge className="bg-green-100 text-green-800">Pagado</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(purchase.total)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/dashboard/purchases/${purchase.id}`}>
                          <DropdownMenuItem>Ver detalle</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteClick(purchase)}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-600">
        Mostrando {filteredPurchases.length} de {purchases.length} compras
      </div>

      {purchaseToDelete && (
        <DeletePurchaseDialog
          purchase={purchaseToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </div>
  )
}
