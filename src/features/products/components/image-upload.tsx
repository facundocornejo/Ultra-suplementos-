'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { toast } from 'sonner'
import { compressImage, formatFileSize } from '@/shared/lib/image-utils'

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
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen valida')
      return
    }

    // Validar tamano original (maximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 10MB')
      return
    }

    setIsUploading(true)
    setCompressionInfo(null)

    try {
      // Comprimir imagen a WebP
      const originalSize = file.size
      const compressedBlob = await compressImage(file, 800, 800, 0.8)
      const compressedSize = compressedBlob.size

      // Mostrar info de compresion
      const savings = Math.round((1 - compressedSize / originalSize) * 100)
      setCompressionInfo(
        `${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${savings}% reducido)`
      )

      // Mostrar preview local
      const previewBlobUrl = URL.createObjectURL(compressedBlob)
      setPreviewUrl(previewBlobUrl)

      // Crear FormData para subir
      const formData = new FormData()
      formData.append('file', compressedBlob, 'image.webp')
      if (productId) {
        formData.append('productId', productId)
      }

      // Subir via API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al subir la imagen')
      }

      onImageUploaded(result.publicUrl)
      toast.success('Imagen subida correctamente')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(error instanceof Error ? error.message : 'Error al subir la imagen')
      setPreviewUrl(currentImageUrl)
      setCompressionInfo(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    setCompressionInfo(null)
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
              unoptimized={previewUrl.startsWith('blob:')}
            />
          </div>
          {compressionInfo && (
            <p className="mt-2 text-xs text-green-600">{compressionInfo}</p>
          )}
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
          <p className="mt-1 text-xs text-gray-500">
            PNG, JPG, WEBP, HEIC (se comprime automaticamente)
          </p>
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
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-orange-500" />
          <p className="text-sm text-gray-600">Comprimiendo y subiendo...</p>
        </div>
      )}
    </div>
  )
}
