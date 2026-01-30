'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ProductSearch } from './product-search'
import { Cart } from './cart'
import { PaymentSelector } from './payment-selector'
import { SaleCompleteDialog } from './sale-complete-dialog'
import { useCart } from '../hooks/use-cart'
import { createSale } from '../actions'
import { toast } from 'sonner'

type Product = {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  sale_price: number
  stock: number
  image_url: string | null
  categories: {
    name: string
  } | null
}

type PaymentMethod = 'cash' | 'debit' | 'credit' | 'transfer' | 'mercadopago'

interface POSScreenProps {
  products: Product[]
}

export function POSScreen({ products }: POSScreenProps) {
  const { items, addItem, removeItem, updateQuantity, clear, subtotal, itemCount } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completedSaleId, setCompletedSaleId] = useState<string | null>(null)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)

  const handleProductSelect = (product: Product) => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.sale_price,
        stock: product.stock,
        imageUrl: product.image_url,
      },
      1
    )
    toast.success(`${product.name} agregado al carrito`)
  }

  const handleCompleteSale = async () => {
    if (items.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const saleData = {
        customer_id: null,
        payment_method: paymentMethod,
        subtotal: subtotal, // Subtotal antes de descuentos
        discount_amount: 0, // Sin descuento por ahora
        total: subtotal,    // Total = subtotal - descuento
        items: items.map((item) => ({
          product_id: item.productId,
          product_name: item.name,
          product_sku: item.sku || null,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        })),
      }

      const result = await createSale(saleData)

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      if (result.data) {
        setCompletedSaleId(result.data.id)
        setShowCompleteDialog(true)
        toast.success('Venta registrada correctamente')
      }
    } catch (err) {
      const errorMessage = 'Error al procesar la venta'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNewSale = () => {
    clear()
    setPaymentMethod('cash')
    setError(null)
    setCompletedSaleId(null)
    setShowCompleteDialog(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Columna Izquierda: Búsqueda de Productos */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Buscar Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductSearch
              products={products.filter((p) => p.stock > 0)}
              onProductSelect={handleProductSelect}
            />
          </CardContent>
        </Card>

        {/* Productos Destacados / Recientes (Opcional) */}
        <Card className="hidden lg:block">
          <CardHeader>
            <CardTitle>Productos Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {products
                .filter((p) => p.stock > 0)
                .slice(0, 12)
                .map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="p-3 text-left rounded-lg border hover:border-orange-500 hover:bg-orange-50 transition-colors"
                  >
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      ${product.sale_price}
                    </p>
                  </button>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna Derecha: Carrito y Pago */}
      <div className="space-y-6">
        <Card className="h-[calc(100vh-20rem)]">
          <CardContent className="p-6 h-full">
            <Cart
              items={items}
              subtotal={subtotal}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onClear={clear}
            />
          </CardContent>
        </Card>

        {items.length > 0 && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleCompleteSale}
                disabled={isProcessing || items.length === 0}
                className="w-full h-14 text-lg"
                size="lg"
              >
                {isProcessing ? 'Procesando...' : 'Completar Venta'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Diálogo de Venta Completada */}
      {completedSaleId && (
        <SaleCompleteDialog
          open={showCompleteDialog}
          onOpenChange={setShowCompleteDialog}
          saleId={completedSaleId}
          total={subtotal}
          onNewSale={handleNewSale}
        />
      )}
    </div>
  )
}
