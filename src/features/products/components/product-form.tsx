'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductFormData } from '../schemas/product-schema'
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
import { createProduct, updateProduct } from '../actions'
import { useState, useTransition } from 'react'
import { ImageUpload } from './image-upload'

type Category = {
  id: string
  name: string
}

type Location = {
  id: string
  name: string
}

type Product = {
  id: string
  name: string
  description: string | null
  category_id: string
  purchase_price: number
  sale_price: number
  stock: number
  min_stock: number
  expiration_date: string | null
  image_url: string | null
  location_id: string
}

interface ProductFormProps {
  categories: Category[]
  locations: Location[]
  product?: Product
}

export function ProductForm({ categories, locations, product }: ProductFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(product?.image_url || null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<ProductFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: product
      ? {
          name: product.name,
          description: product.description || '',
          category_id: product.category_id,
          purchase_price: product.purchase_price,
          sale_price: product.sale_price,
          stock: product.stock,
          min_stock: product.min_stock,
          expiration_date: product.expiration_date || '',
          image_url: product.image_url || '',
          location_id: product.location_id,
        }
      : {
          name: '',
          description: '',
          category_id: categories[0]?.id || '',
          purchase_price: 0,
          sale_price: 0,
          stock: 0,
          min_stock: 5,
          expiration_date: '',
          image_url: '',
          location_id: locations[0]?.id || '',
        },
  })

  const onSubmit = async (data: ProductFormData) => {
    setError(null)

    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description || '')
    formData.append('category_id', data.category_id)
    formData.append('purchase_price', data.purchase_price.toString())
    formData.append('sale_price', data.sale_price.toString())
    formData.append('stock', data.stock.toString())
    formData.append('min_stock', data.min_stock.toString())
    formData.append('expiration_date', data.expiration_date || '')
    formData.append('image_url', imageUrl || '')
    formData.append('location_id', data.location_id)

    startTransition(async () => {
      try {
        if (product) {
          await updateProduct(product.id, formData)
        } else {
          await createProduct(formData)
        }
      } catch {
        setError('Ocurrio un error al guardar el producto')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Informacion Basica */}
      <Card>
        <CardHeader>
          <CardTitle>Informacion Basica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">
                Nombre del Producto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ej: Proteina Whey 1kg"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descripcion del producto..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">
                Categoria <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category_id && (
                <p className="text-sm text-red-500">{errors.category_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_id">
                Ubicacion <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="location_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar ubicacion" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.location_id && (
                <p className="text-sm text-red-500">{errors.location_id.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Precios y Stock */}
      <Card>
        <CardHeader>
          <CardTitle>Precios y Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price">
                Precio de Compra <span className="text-red-500">*</span>
              </Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                {...register('purchase_price')}
                placeholder="0.00"
              />
              {errors.purchase_price && (
                <p className="text-sm text-red-500">{errors.purchase_price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_price">
                Precio de Venta <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                {...register('sale_price')}
                placeholder="0.00"
              />
              {errors.sale_price && (
                <p className="text-sm text-red-500">{errors.sale_price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">
                Stock Actual <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                {...register('stock')}
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-sm text-red-500">{errors.stock.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_stock">
                Stock Minimo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="min_stock"
                type="number"
                {...register('min_stock')}
                placeholder="5"
              />
              {errors.min_stock && (
                <p className="text-sm text-red-500">{errors.min_stock.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration_date">Fecha de Vencimiento</Label>
              <Input
                id="expiration_date"
                type="date"
                {...register('expiration_date')}
              />
              {errors.expiration_date && (
                <p className="text-sm text-red-500">{errors.expiration_date.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Imagen */}
      <Card>
        <CardHeader>
          <CardTitle>Imagen del Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            currentImageUrl={imageUrl}
            onImageUploaded={(url) => {
              setImageUrl(url)
              setValue('image_url', url)
            }}
            productId={product?.id}
          />
        </CardContent>
      </Card>

      {/* Botones */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : product ? 'Actualizar Producto' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  )
}
