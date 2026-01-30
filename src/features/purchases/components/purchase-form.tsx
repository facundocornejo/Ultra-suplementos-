'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/shared/lib/formatters'
import { createPurchase } from '../actions'
import { Trash2, Plus } from 'lucide-react'

type Supplier = {
  id: string
  business_name: string
}

type Product = {
  id: string
  name: string
  purchase_price: number
  stock: number
}

type PurchaseItem = {
  product_id: string
  product_name: string
  quantity: number
  unit_cost: number
  expiration_date: string
  subtotal: number
}

interface PurchaseFormProps {
  suppliers: Supplier[]
  products: Product[]
}

export function PurchaseForm({ suppliers, products }: PurchaseFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [supplierId, setSupplierId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('paid')
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [notes, setNotes] = useState('')

  // Items state
  const [items, setItems] = useState<PurchaseItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [itemQuantity, setItemQuantity] = useState(1)
  const [itemCost, setItemCost] = useState(0)
  const [itemExpiration, setItemExpiration] = useState('')

  const total = items.reduce((sum, item) => sum + item.subtotal, 0)

  const handleAddItem = () => {
    if (!selectedProductId || itemQuantity < 1 || itemCost < 0) return

    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    // Verificar si el producto ya esta en la lista
    const existingIndex = items.findIndex((i) => i.product_id === selectedProductId)
    if (existingIndex >= 0) {
      const updated = [...items]
      updated[existingIndex].quantity += itemQuantity
      updated[existingIndex].unit_cost = itemCost
      updated[existingIndex].subtotal = updated[existingIndex].quantity * itemCost
      if (itemExpiration) {
        updated[existingIndex].expiration_date = itemExpiration
      }
      setItems(updated)
    } else {
      setItems([
        ...items,
        {
          product_id: selectedProductId,
          product_name: product.name,
          quantity: itemQuantity,
          unit_cost: itemCost,
          expiration_date: itemExpiration,
          subtotal: Math.round(itemQuantity * itemCost * 100) / 100,
        },
      ])
    }

    // Reset item fields
    setSelectedProductId('')
    setItemQuantity(1)
    setItemCost(0)
    setItemExpiration('')
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId)
    const product = products.find((p) => p.id === productId)
    if (product) {
      setItemCost(product.purchase_price)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!supplierId) {
      setError('Debe seleccionar un proveedor')
      return
    }
    if (items.length === 0) {
      setError('Debe agregar al menos un producto')
      return
    }

    startTransition(async () => {
      try {
        const result = await createPurchase({
          supplier_id: supplierId,
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          notes: notes || null,
          purchase_date: purchaseDate,
          items: items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            expiration_date: item.expiration_date || null,
          })),
        })

        if (result?.error) {
          setError(result.error)
        }
      } catch {
        setError('Ocurrio un error al registrar la compra')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Datos de la compra */}
      <Card>
        <CardHeader>
          <CardTitle>Datos de la Compra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Proveedor <span className="text-red-500">*</span></Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.business_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha de compra <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Metodo de pago</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="debit">Debito</SelectItem>
                  <SelectItem value="credit">Credito</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado de pago</Label>
              <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as 'paid' | 'pending')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Pagado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas opcionales..."
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agregar productos */}
      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Agregar item */}
          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-4 space-y-1">
              <Label className="text-xs">Producto</Label>
              <Select value={selectedProductId} onValueChange={handleProductSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Cantidad</Label>
              <Input
                type="number"
                min={1}
                value={itemQuantity}
                onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Costo unitario</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={itemCost}
                onChange={(e) => setItemCost(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Vencimiento</Label>
              <Input
                type="date"
                value={itemExpiration}
                onChange={(e) => setItemExpiration(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Button
                type="button"
                onClick={handleAddItem}
                disabled={!selectedProductId || itemQuantity < 1}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
          </div>

          {/* Tabla de items */}
          {items.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Costo Unit.</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unit_cost)}</TableCell>
                      <TableCell>
                        {item.expiration_date || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.subtotal)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-bold">
                      TOTAL
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {formatCurrency(total)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {items.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
              Agrega productos a la compra usando el formulario de arriba
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botones */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || items.length === 0}>
          {isPending ? 'Registrando...' : 'Registrar Compra'}
        </Button>
      </div>
    </form>
  )
}
