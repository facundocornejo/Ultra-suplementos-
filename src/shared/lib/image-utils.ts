/**
 * Comprime y convierte una imagen a WebP
 * @param file - Archivo de imagen original
 * @param maxWidth - Ancho máximo (default 800px)
 * @param maxHeight - Alto máximo (default 800px)
 * @param quality - Calidad de compresión 0-1 (default 0.8)
 * @returns Blob de la imagen comprimida en formato WebP
 */
export async function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('No se pudo crear el contexto del canvas'))
      return
    }

    img.onload = () => {
      // Calcular dimensiones manteniendo aspect ratio
      let { width, height } = img

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      // Redondear dimensiones
      width = Math.round(width)
      height = Math.round(height)

      canvas.width = width
      canvas.height = height

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height)

      // Convertir a WebP
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Error al comprimir la imagen'))
          }
        },
        'image/webp',
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'))
    }

    // Cargar imagen desde File
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Formatea el tamaño de archivo en formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
