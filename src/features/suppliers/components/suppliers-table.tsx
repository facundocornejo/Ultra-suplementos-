'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
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
import { Pencil, Trash2, Eye } from 'lucide-react'
import { deleteSupplier } from '../actions'
import { toast } from 'sonner'
import { formatCUIT, formatPhone } from '@/shared/lib/formatters'

interface Supplier {
  id: string
  business_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  cuit: string | null
  city: string | null
}

interface SuppliersTableProps {
  suppliers: Supplier[]
}

export function SuppliersTable({ suppliers }: SuppliersTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!deleteId) return

    startTransition(async () => {
      const result = await deleteSupplier(deleteId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Proveedor eliminado correctamente')
      }
      setDeleteId(null)
    })
  }

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No hay proveedores registrados</p>
        <Link href="/dashboard/suppliers/new">
          <Button className="bg-orange-500 hover:bg-orange-600">
            Agregar primer proveedor
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razón Social</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>CUIT</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.business_name}</TableCell>
                <TableCell>{supplier.contact_name || '-'}</TableCell>
                <TableCell>
                  {supplier.cuit ? formatCUIT(supplier.cuit) : '-'}
                </TableCell>
                <TableCell>
                  {supplier.phone ? formatPhone(supplier.phone) : '-'}
                </TableCell>
                <TableCell>{supplier.city || '-'}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/suppliers/${supplier.id}`}>
                      <Button variant="ghost" size="icon" title="Ver detalle">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/suppliers/${supplier.id}/edit`}>
                      <Button variant="ghost" size="icon" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Eliminar"
                      onClick={() => setDeleteId(supplier.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
            <AlertDialogDescription>
              El proveedor será desactivado y no aparecerá en las búsquedas.
              Las compras históricas se mantendrán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
