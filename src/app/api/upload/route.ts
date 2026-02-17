import { NextRequest, NextResponse } from 'next/server'
import { createServerActionClient } from '@/core/infrastructure/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const productId = formData.get('productId') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 2MB después de compresión)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'La imagen debe ser menor a 2MB' },
        { status: 400 }
      )
    }

    const supabase = await createServerActionClient()

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const fileName = productId
      ? `${productId}-${timestamp}.webp`
      : `${timestamp}-${randomId}.webp`
    const filePath = `products/${fileName}`

    // Convertir File a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: 'image/webp',
        upsert: true,
      })

    if (error) {
      console.error('Error uploading image:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      path: data.path,
      publicUrl,
    })
  } catch (error) {
    console.error('Error in upload route:', error)
    return NextResponse.json(
      { error: 'Error al procesar la imagen' },
      { status: 500 }
    )
  }
}
