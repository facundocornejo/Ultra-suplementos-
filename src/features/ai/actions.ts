'use server'

import { createServerActionClient } from '@/core/infrastructure/supabase/client'
import { revalidatePath } from 'next/cache'
import {
  generateProductDescription,
  generateSocialPost,
  generateSQLFromNaturalLanguage,
  ChatMessage as GroqChatMessage,
  AIServiceError,
} from './services/groq'
import {
  generateEmbedding,
  createProductEmbeddingText,
} from './services/embeddings'
import { chatWithProductContext, searchProductsByQuery } from './services/rag'
import type {
  GenerateDescriptionResult,
  GenerateSocialPostResult,
  SyncEmbeddingsResult,
  SocialPlatform,
  ProductWithSimilarity,
} from './types'

// Helper para extraer el nombre de categoría de forma segura
// Supabase puede retornar objeto, array, o null dependiendo de la relación
function extractCategoryName(category: unknown): string | undefined {
  if (!category) return undefined
  if (Array.isArray(category)) {
    const first = category[0] as { name?: string } | undefined
    return first?.name
  }
  return (category as { name?: string })?.name
}

// =============================================================================
// CHATBOT
// =============================================================================

type ChatHistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

export async function sendChatMessage(
  message: string,
  history: ChatHistoryMessage[]
): Promise<{ response: string; error?: string; isRateLimit?: boolean }> {
  try {
    const supabase = await createServerActionClient()

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { response: '', error: 'No autenticado' }
    }

    // Convertir al formato que espera groq
    const groqHistory: GroqChatMessage[] = history.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const response = await chatWithProductContext(message, groqHistory)
    return { response }
  } catch (error) {
    console.error('Chat error:', error)

    // Manejar errores específicos de IA
    if (error instanceof AIServiceError) {
      return {
        response: '',
        error: error.message,
        isRateLimit: error.isRateLimit,
      }
    }

    return {
      response: '',
      error: 'Hubo un error al procesar tu mensaje. Por favor intentá de nuevo.',
    }
  }
}

// =============================================================================
// GENERADOR DE DESCRIPCIONES
// =============================================================================

export async function generateAndSaveDescription(
  productId: string
): Promise<GenerateDescriptionResult> {
  try {
    const supabase = await createServerActionClient()

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { description: '', error: 'No autenticado' }
    }

    // Obtener producto con su categoría
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('name, brand, category:categories(name)')
      .eq('id', productId)
      .single()

    if (fetchError || !product) {
      throw new Error('Producto no encontrado')
    }

    // Generar descripción
    const description = await generateProductDescription({
      name: product.name,
      brand: product.brand ?? undefined,
      category: extractCategoryName(product.category),
    })

    // Guardar descripción
    const { error: updateError } = await supabase
      .from('products')
      .update({ description })
      .eq('id', productId)

    if (updateError) throw updateError

    revalidatePath('/dashboard/products')

    return { description }
  } catch (error) {
    console.error('Error generating description:', error)

    // Manejar errores específicos de IA
    if (error instanceof AIServiceError) {
      return {
        description: '',
        error: error.message,
      }
    }

    return {
      description: '',
      error: 'Error al generar la descripción',
    }
  }
}

// =============================================================================
// GENERADOR DE POSTS PARA REDES SOCIALES
// =============================================================================

export async function generateProductSocialPost(
  productId: string,
  platform: SocialPlatform
): Promise<GenerateSocialPostResult> {
  try {
    const supabase = await createServerActionClient()

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { post: '', error: 'No autenticado' }
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('name, description, brand, sale_price, category:categories(name)')
      .eq('id', productId)
      .single()

    if (error || !product) {
      throw new Error('Producto no encontrado')
    }

    const post = await generateSocialPost(
      {
        name: product.name,
        description: product.description ?? undefined,
        brand: product.brand ?? undefined,
        category: extractCategoryName(product.category),
        price: product.sale_price,
      },
      platform
    )

    return { post }
  } catch (error) {
    console.error('Error generating social post:', error)

    // Manejar errores específicos de IA
    if (error instanceof AIServiceError) {
      return { post: '', error: error.message }
    }

    return { post: '', error: 'Error al generar el post' }
  }
}

// =============================================================================
// DASHBOARD CON LENGUAJE NATURAL
// =============================================================================

const AVAILABLE_TABLES = `
- products: id, name, description, brand, price, cost_price, stock, min_stock, barcode, expiration_date, is_active, category_id, created_at
- categories: id, name
- sales: id, total, payment_method, customer_id, user_id, cash_session_id, created_at
- sale_items: id, sale_id, product_id, quantity, unit_price, subtotal
- customers: id, name, email, phone, dni, created_at
- cash_sessions: id, opening_balance, closing_balance, total_sales, total_cash, status, opened_at, closed_at
- suppliers: id, name, contact_name, phone, email
- stock_movements: id, product_id, quantity, type (entrada, salida, ajuste), reason, created_at

Vistas útiles:
- products_low_stock: productos con stock <= min_stock
- products_expiring_soon: productos que vencen en 3 meses
- sales_daily_summary: resumen diario de ventas
`

// Patrones SQL peligrosos que NO deben permitirse
const DANGEROUS_SQL_PATTERNS = [
  /;/,                           // Múltiples statements
  /--/,                          // Comentarios SQL
  /\/\*/,                        // Comentarios de bloque
  /\bDROP\b/i,
  /\bDELETE\b/i,
  /\bINSERT\b/i,
  /\bUPDATE\b/i,
  /\bTRUNCATE\b/i,
  /\bALTER\b/i,
  /\bCREATE\b/i,
  /\bGRANT\b/i,
  /\bREVOKE\b/i,
  /\bEXEC\b/i,
  /\bEXECUTE\b/i,
  /\bINTO\s+OUTFILE\b/i,
  /\bINTO\s+DUMPFILE\b/i,
  /\bLOAD_FILE\b/i,
  /\bUNION\b/i,                  // Prevenir UNION-based injection
  /\bINFORMATION_SCHEMA\b/i,     // Prevenir enumeración de schema
  /\bpg_/i,                      // Prevenir acceso a tablas de sistema PostgreSQL
]

// Tablas permitidas para consultas
const ALLOWED_TABLES = [
  'products',
  'categories',
  'sales',
  'sale_items',
  'customers',
  'cash_sessions',
  'suppliers',
  'stock_movements',
  'purchases',
  'purchase_items',
  'products_low_stock',
  'products_expiring_soon',
  'sales_daily_summary',
]

function validateSQL(sql: string): { valid: boolean; error?: string } {
  const normalizedSQL = sql.trim().toUpperCase()

  // 1. Debe empezar con SELECT
  if (!normalizedSQL.startsWith('SELECT')) {
    return { valid: false, error: 'Solo se permiten consultas de lectura (SELECT)' }
  }

  // 2. Verificar patrones peligrosos
  for (const pattern of DANGEROUS_SQL_PATTERNS) {
    if (pattern.test(sql)) {
      return { valid: false, error: 'La consulta contiene patrones no permitidos' }
    }
  }

  // 3. Verificar que solo accede a tablas permitidas
  const sqlLower = sql.toLowerCase()
  const fromMatch = sqlLower.match(/\bfrom\s+([a-z_]+)/g)
  const joinMatch = sqlLower.match(/\bjoin\s+([a-z_]+)/g)

  const tablesUsed: string[] = []
  if (fromMatch) {
    fromMatch.forEach(m => {
      const table = m.replace(/^(from|join)\s+/i, '').trim()
      tablesUsed.push(table)
    })
  }
  if (joinMatch) {
    joinMatch.forEach(m => {
      const table = m.replace(/^(from|join)\s+/i, '').trim()
      tablesUsed.push(table)
    })
  }

  for (const table of tablesUsed) {
    if (!ALLOWED_TABLES.includes(table)) {
      return { valid: false, error: `Tabla no permitida: ${table}` }
    }
  }

  return { valid: true }
}

export async function queryDashboardNaturalLanguage(
  question: string
): Promise<{ data: unknown; explanation: string; error?: string }> {
  try {
    const supabase = await createServerActionClient()

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, explanation: '', error: 'No autenticado' }
    }

    // 1. Convertir pregunta a SQL
    const { sql, explanation } = await generateSQLFromNaturalLanguage(
      question,
      AVAILABLE_TABLES
    )

    if (!sql) {
      return { data: null, explanation, error: explanation }
    }

    // 2. Validación estricta de seguridad
    const validation = validateSQL(sql)
    if (!validation.valid) {
      return {
        data: null,
        explanation: '',
        error: validation.error || 'Consulta no permitida por razones de seguridad',
      }
    }

    // 3. Ejecutar query via función segura
    const { data, error } = await supabase.rpc('execute_readonly_query', {
      query_text: sql,
    })

    if (error) {
      console.error('Query error:', error)
      return {
        data: null,
        explanation: '',
        error: `Error en la consulta: ${error.message}`,
      }
    }

    return { data, explanation }
  } catch (error) {
    console.error('Dashboard query error:', error)
    return {
      data: null,
      explanation: '',
      error: 'Error al procesar la consulta',
    }
  }
}

// =============================================================================
// SINCRONIZACIÓN DE EMBEDDINGS
// =============================================================================

export async function syncProductEmbeddings(): Promise<SyncEmbeddingsResult> {
  const supabase = await createServerActionClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { synced: 0, errors: 0 }
  }

  // Obtener productos sin embedding
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, brand, category:categories(name)')
    .is('embedding', null)
    .eq('is_active', true)
    .limit(50) // Procesar en batches

  if (error || !products?.length) {
    return { synced: 0, errors: 0 }
  }

  let synced = 0
  let errors = 0

  for (const product of products) {
    try {
      // Crear texto para embedding
      const text = createProductEmbeddingText({
        name: product.name,
        description: product.description,
        brand: product.brand,
        categoryName: extractCategoryName(product.category),
      })

      // Generar embedding
      const embedding = await generateEmbedding(text)

      // Guardar en DB
      const { error: updateError } = await supabase
        .from('products')
        .update({ embedding })
        .eq('id', product.id)

      if (updateError) throw updateError

      synced++

      // Rate limiting básico
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (err) {
      console.error(`Error syncing product ${product.id}:`, err)
      errors++
    }
  }

  return { synced, errors }
}

// =============================================================================
// BÚSQUEDA SEMÁNTICA DE PRODUCTOS
// =============================================================================

export async function searchProducts(
  query: string
): Promise<{ products: ProductWithSimilarity[]; error: string | null }> {
  try {
    const supabase = await createServerActionClient()

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { products: [], error: 'No autenticado' }
    }

    const products = await searchProductsByQuery(query, 10)
    return { products: products ?? [], error: null }
  } catch (error) {
    console.error('Search error:', error)
    return { products: [], error: 'Error al buscar productos' }
  }
}
