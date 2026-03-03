'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updatePaymentSurcharges } from '../actions'
import {
  paymentSurchargesSchema,
  type PaymentSurcharges,
} from '../schemas/settings-schema'
import { Banknote, CreditCard, Landmark, ArrowLeftRight, Smartphone } from 'lucide-react'

interface SurchargesFormProps {
  initialData: PaymentSurcharges
}

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Efectivo', icon: Banknote, description: 'Sin recargo recomendado' },
  { key: 'debit', label: 'Débito', icon: CreditCard, description: 'Comisión típica: 1-3%' },
  { key: 'credit', label: 'Crédito', icon: CreditCard, description: 'Comisión típica: 3-8%' },
  { key: 'transfer', label: 'Transferencia', icon: Landmark, description: 'Sin recargo recomendado' },
  { key: 'mercadopago', label: 'MercadoPago', icon: Smartphone, description: 'Comisión típica: 4-6%' },
] as const

export function SurchargesForm({ initialData }: SurchargesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PaymentSurcharges>({
    resolver: zodResolver(paymentSurchargesSchema),
    defaultValues: initialData,
  })

  const onSubmit = async (data: PaymentSurcharges) => {
    setIsSubmitting(true)
    try {
      const result = await updatePaymentSurcharges(data)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Configuración guardada correctamente')
      }
    } catch {
      toast.error('Error al guardar la configuración')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          Recargos por Método de Pago
        </CardTitle>
        <CardDescription>
          Configura el porcentaje de recargo para cada método de pago.
          El recargo se aplica automáticamente al total de la venta.
          El cliente no ve el desglose, solo el precio final.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PAYMENT_METHODS.map(({ key, label, icon: Icon, description }) => (
              <div
                key={key}
                className="p-4 border rounded-lg space-y-3 hover:border-orange-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">{label}</span>
                </div>
                <div>
                  <Label htmlFor={key} className="sr-only">
                    Recargo {label}
                  </Label>
                  <div className="relative">
                    <Input
                      id={key}
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      {...form.register(key as keyof PaymentSurcharges, {
                        valueAsNumber: true,
                      })}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                  {form.formState.errors[key as keyof PaymentSurcharges] && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors[key as keyof PaymentSurcharges]?.message}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
