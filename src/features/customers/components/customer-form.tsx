'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface Customer {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  dni: string | null
  address: string | null
  city: string | null
  notes: string | null
}

interface CustomerFormProps {
  customer?: Customer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (formData: FormData) => any
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="bg-orange-500 hover:bg-orange-600">
      {pending ? 'Guardando...' : isEditing ? 'Actualizar Cliente' : 'Crear Cliente'}
    </Button>
  )
}

export function CustomerForm({ customer, action }: CustomerFormProps) {
  const isEditing = !!customer

  return (
    <form action={action as (formData: FormData) => void}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre completo *</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={customer?.full_name || ''}
                required
                placeholder="Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                name="dni"
                defaultValue={customer?.dni || ''}
                placeholder="12345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={customer?.email || ''}
                placeholder="cliente@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={customer?.phone || ''}
                placeholder="343 1234567"
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                defaultValue={customer?.address || ''}
                placeholder="Calle 123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                name="city"
                defaultValue={customer?.city || ''}
                placeholder="Paraná"
              />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={customer?.notes || ''}
              placeholder="Información adicional del cliente..."
              rows={3}
            />
          </div>

          {/* Acciones */}
          <div className="flex gap-4 pt-4">
            <SubmitButton isEditing={isEditing} />
            <Link href="/dashboard/customers">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
