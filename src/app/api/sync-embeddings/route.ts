import { NextResponse } from 'next/server'
import { syncProductEmbeddings } from '@/features/ai/actions'
import { createServerActionClient } from '@/core/infrastructure/supabase/client'

export async function POST() {
  try {
    // Verificar autenticación
    const supabase = await createServerActionClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Sincronizar embeddings
    const result = await syncProductEmbeddings()

    return NextResponse.json({
      success: true,
      message: `Sincronización completada`,
      synced: result.synced,
      errors: result.errors,
    })
  } catch (error) {
    console.error('Error syncing embeddings:', error)
    return NextResponse.json(
      { error: 'Error al sincronizar embeddings' },
      { status: 500 }
    )
  }
}

// También permitir GET para facilitar pruebas desde el navegador
export async function GET() {
  return NextResponse.json({
    message: 'Usá POST para sincronizar embeddings',
    ejemplo: "fetch('/api/sync-embeddings', { method: 'POST' })",
  })
}
