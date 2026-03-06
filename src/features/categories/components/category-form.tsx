'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  sort_order: number
}

interface CategoryFormProps {
  category?: Category
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (formData: FormData) => any
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="bg-orange-500 hover:bg-orange-600">
      {pending ? 'Guardando...' : isEditing ? 'Actualizar Categoria' : 'Crear Categoria'}
    </Button>
  )
}

export function CategoryForm({ category, action }: CategoryFormProps) {
  const isEditing = !!category

  return (
    <form action={action as (formData: FormData) => void}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Categoria' : 'Nueva Categoria'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={category?.name || ''}
                required
                placeholder="Ej: Proteinas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icono (emoji)</Label>
              <Input
                id="icon"
                name="icon"
                defaultValue={category?.icon || ''}
                placeholder="Ej: 💪"
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Orden</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue={category?.sort_order ?? 0}
                min={0}
                max={9999}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={category?.description || ''}
              placeholder="Descripcion opcional de la categoria..."
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <SubmitButton isEditing={isEditing} />
            <Link href="/dashboard/categories">
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
