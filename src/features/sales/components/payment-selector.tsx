'use client'

import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

type PaymentMethod = 'cash' | 'debit' | 'credit' | 'transfer' | 'mercadopago'

interface PaymentSelectorProps {
  value: PaymentMethod
  onChange: (value: PaymentMethod) => void
}

const paymentMethods = [
  { value: 'cash' as PaymentMethod, label: 'Efectivo', icon: '💵' },
  { value: 'debit' as PaymentMethod, label: 'Débito', icon: '💳' },
  { value: 'credit' as PaymentMethod, label: 'Crédito', icon: '💳' },
  { value: 'transfer' as PaymentMethod, label: 'Transferencia', icon: '🏦' },
  { value: 'mercadopago' as PaymentMethod, label: 'Mercado Pago', icon: '📱' },
]

export function PaymentSelector({ value, onChange }: PaymentSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Método de Pago</Label>
      <div className="grid grid-cols-2 gap-3">
        {paymentMethods.map((method) => (
          <Card
            key={method.value}
            className={`cursor-pointer p-4 transition-all ${
              value === method.value
                ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500'
                : 'hover:border-gray-400'
            }`}
            onClick={() => onChange(method.value)}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{method.icon}</span>
              <span className="font-medium">{method.label}</span>
              {value === method.value && (
                <svg
                  className="ml-auto h-5 w-5 text-orange-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
