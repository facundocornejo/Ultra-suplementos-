'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface Supplier {
  id: string
  business_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  cuit: string | null
  notes: string | null
}

interface SupplierFormProps {
  supplier?: Supplier
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (formData: FormData) => any
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="bg-orange-500 hover:bg-orange-600">
      {pending ? 'Guardando...' : isEditing ? 'Actualizar Proveedor' : 'Crear Proveedor'}
    </Button>
  )
}

export function SupplierForm({ supplier, action }: SupplierFormProps) {
  const isEditing = !!supplier

  return (
    <form action={action as (formData: FormData) => void}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información de la empresa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Razón social / Nombre *</Label>
              <Input
                id="business_name"
                name="business_name"
                defaultValue={supplier?.business_name || ''}
                required
                placeholder="Distribuidora XYZ S.A."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuit">CUIT</Label>
              <Input
                id="cuit"
                name="cuit"
                defaultValue={supplier?.cuit || ''}
                placeholder="20-12345678-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_name">Nombre de contacto</Label>
              <Input
                id="contact_name"
                name="contact_name"
                defaultValue={supplier?.contact_name || ''}
                placeholder="Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={supplier?.phone || ''}
                placeholder="343 1234567"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={supplier?.email || ''}
                placeholder="proveedor@email.com"
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
                defaultValue={supplier?.address || ''}
                placeholder="Calle 123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                name="city"
                defaultValue={supplier?.city || ''}
                placeholder="Buenos Aires"
              />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={supplier?.notes || ''}
              placeholder="Información adicional del proveedor..."
              rows={3}
            />
          </div>

          {/* Acciones */}
          <div className="flex gap-4 pt-4">
            <SubmitButton isEditing={isEditing} />
            <Link href="/dashboard/suppliers">
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
