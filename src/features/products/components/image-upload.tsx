'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { uploadProductImage } from '../actions'
import Image from 'next/image'
import { toast } from 'sonner'

interface ImageUploadProps {
  currentImageUrl: string | null
  onImageUploaded: (url: string) => void
  productId?: string
}

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  productId,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB')
      return
    }

    // Mostrar preview local
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Subir a Supabase
    setIsUploading(true)
    try {
      const result = await uploadProductImage(file, productId)

      if (result.error) {
        toast.error('Error al subir la imagen: ' + result.error)
        setPreviewUrl(currentImageUrl)
        return
      }

      if (result.data) {
        onImageUploaded(result.data.publicUrl)
        toast.success('Imagen subida correctamente')
      }
    } catch (error) {
      toast.error('Error al subir la imagen')
      setPreviewUrl(currentImageUrl)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageUploaded('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative w-full max-w-md">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-gray-200">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Cambiar Imagen
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
              disabled={isUploading}
            >
              Eliminar
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 hover:border-gray-400"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            className="mb-4 h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <p className="text-sm text-gray-600">Click para subir una imagen</p>
          <p className="mt-1 text-xs text-gray-500">PNG, JPG hasta 5MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {isUploading && (
        <p className="text-sm text-gray-600">Subiendo imagen...</p>
      )}
    </div>
  )
}
