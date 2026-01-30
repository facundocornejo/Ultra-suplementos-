import { createServerActionClient } from '@/core/infrastructure/supabase/client'
import { generateEmbedding } from './embeddings'
import { chatCompletion, ChatMessage } from './groq'

export async function searchProductsByQuery(query: string, limit = 5) {
  const supabase = await createServerActionClient()

  // 1. Generar embedding de la query del usuario
  const queryEmbedding = await generateEmbedding(query)

  // 2. Buscar productos similares usando la función de Supabase
  const { data: products, error } = await supabase.rpc('match_products', {
    query_embedding: queryEmbedding,
    match_threshold: 0.3, // Umbral bajo para más resultados
    match_count: limit,
  })

  if (error) {
    console.error('Error searching products:', error)
    throw error
  }

  return products
}

export async function chatWithProductContext(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  const supabase = await createServerActionClient()

  // 1. Generar embedding del mensaje
  const queryEmbedding = await generateEmbedding(userMessage)

  // 2. Obtener contexto de productos relevantes
  const { data: context } = await supabase.rpc('get_products_context', {
    query_embedding: queryEmbedding,
    max_products: 8,
  })

  // 3. Obtener info adicional del negocio
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // 4. Construir el prompt del sistema
  const systemPrompt = `Eres el asistente virtual de Ultra Suplementos, una tienda de suplementos deportivos ubicada en 25 de mayo 347, Paraná, Argentina.

Instagram: @ultrasuplementospna

Tu rol:
- Ayudar a clientes a encontrar productos
- Responder preguntas sobre suplementos
- Recomendar productos basándote en los objetivos del cliente
- Ser amigable y usar español argentino

Información del catálogo (${totalProducts ?? 0} productos activos):
${context || 'No hay productos cargados aún.'}

Reglas importantes:
- Solo recomendar productos que aparecen en el catálogo
- Si no tenés un producto, decirlo honestamente
- Siempre mencionar que pueden consultar disponibilidad y precios actualizados en la tienda
- NO inventar productos ni precios
- Ser conciso pero útil`

  // 5. Construir mensajes para el LLM
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-6), // Últimos 6 mensajes para contexto
    { role: 'user', content: userMessage },
  ]

  // 6. Obtener respuesta
  return chatCompletion(messages, {
    temperature: 0.7,
    maxTokens: 500,
  })
}
