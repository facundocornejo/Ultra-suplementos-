import { GoogleGenerativeAI } from '@google/generative-ai'

// Lazy initialization para evitar errores en build time
let geminiClient: GoogleGenerativeAI | null = null

function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        'GEMINI_API_KEY no está configurada. Revisá tu archivo .env.local'
      )
    }
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return geminiClient
}

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Clase de error personalizada para errores de IA
export class AIServiceError extends Error {
  public readonly code: string
  public readonly isRateLimit: boolean
  public readonly retryAfter?: number

  constructor(message: string, code: string, isRateLimit = false, retryAfter?: number) {
    super(message)
    this.name = 'AIServiceError'
    this.code = code
    this.isRateLimit = isRateLimit
    this.retryAfter = retryAfter
  }
}

// Función para parsear errores de Gemini
function parseGeminiError(error: unknown): AIServiceError {
  // Loguear el error completo para debugging
  console.error('Gemini error details:', JSON.stringify(error, null, 2))

  const err = error as { status?: number; message?: string; statusText?: string; errorDetails?: unknown[] }
  const errorMessage = err.message?.toLowerCase() || ''

  // Error de modelo no encontrado (verificar primero)
  if (err.status === 404 || errorMessage.includes('not found') || errorMessage.includes('is not found')) {
    return new AIServiceError(
      'El modelo de IA no está disponible. Contactá al administrador.',
      'MODEL_NOT_FOUND'
    )
  }

  // Rate limit (429)
  if (err.status === 429 || errorMessage.includes('429') || errorMessage.includes('quota')) {
    return new AIServiceError(
      'Se alcanzó el límite de uso de la IA. Por favor esperá unos minutos antes de intentar de nuevo.',
      'RATE_LIMIT',
      true,
      60
    )
  }

  // Error de autenticación (401/403)
  if (err.status === 401 || err.status === 403 || errorMessage.includes('api key') || errorMessage.includes('authentication')) {
    return new AIServiceError(
      'Error de autenticación con el servicio de IA. Verificá la configuración de la API key.',
      'AUTH_ERROR'
    )
  }

  // Servicio no disponible (503)
  if (err.status === 503 || errorMessage.includes('unavailable')) {
    return new AIServiceError(
      'El servicio de IA no está disponible temporalmente. Intentá de nuevo en unos minutos.',
      'SERVICE_UNAVAILABLE',
      true,
      30
    )
  }

  // Error de contenido bloqueado (safety)
  if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
    return new AIServiceError(
      'La solicitud fue bloqueada por políticas de seguridad. Intentá reformular tu pregunta.',
      'CONTENT_BLOCKED'
    )
  }

  // Error genérico con el mensaje original para debugging
  const displayMessage = err.message
    ? `Error de IA: ${err.message.substring(0, 100)}`
    : 'Ocurrió un error al procesar tu solicitud con IA. Por favor intentá de nuevo.'

  return new AIServiceError(displayMessage, 'UNKNOWN_ERROR')
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: {
    temperature?: number
    maxTokens?: number
  }
): Promise<string> {
  try {
    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 1024,
      },
    })

    // Convertir mensajes al formato de Gemini
    // Gemini no tiene "system" role, lo agregamos al primer mensaje de usuario
    const systemMessage = messages.find((m) => m.role === 'system')
    const chatMessages = messages.filter((m) => m.role !== 'system')

    // Construir el historial para Gemini
    const history = chatMessages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    // El último mensaje es el que enviamos
    const lastMessage = chatMessages[chatMessages.length - 1]
    let userMessage = lastMessage?.content ?? ''

    // Si hay system message, lo prepend al contexto
    if (systemMessage) {
      userMessage = `Instrucciones del sistema:\n${systemMessage.content}\n\nMensaje del usuario:\n${userMessage}`
    }

    const chat = model.startChat({ history })
    const result = await chat.sendMessage(userMessage)
    const response = result.response

    return response.text()
  } catch (error) {
    console.error('Error en chatCompletion:', error)
    throw parseGeminiError(error)
  }
}

// Función específica para generar descripciones de productos
export async function generateProductDescription(product: {
  name: string
  brand?: string
  category?: string
}): Promise<string> {
  const prompt = `Genera una descripción de producto para una tienda de suplementos deportivos.

Producto: ${product.name}
${product.brand ? `Marca: ${product.brand}` : ''}
${product.category ? `Categoría: ${product.category}` : ''}

Requisitos:
- Máximo 2-3 oraciones
- Mencionar beneficios principales
- Tono profesional pero cercano
- En español argentino
- NO inventar ingredientes ni datos específicos que no conozcas

Descripción:`

  return chatCompletion([{ role: 'user', content: prompt }], {
    temperature: 0.7,
    maxTokens: 200,
  })
}

// Función para generar posts de redes sociales
export async function generateSocialPost(
  product: {
    name: string
    description?: string
    brand?: string
    category?: string
    price: number
  },
  platform: 'instagram' | 'facebook' | 'whatsapp'
): Promise<string> {
  const platformInstructions = {
    instagram: `
- Incluir emojis relevantes (💪🏋️‍♂️🔥)
- Usar hashtags populares de fitness (#suplementos #fitness #gym #proteina)
- Máximo 2200 caracteres
- Incluir call-to-action (CTA)
- Formato visual con saltos de línea`,
    facebook: `
- Tono más conversacional
- Puede ser más largo
- Incluir precio y disponibilidad
- CTA claro`,
    whatsapp: `
- Mensaje corto y directo
- Incluir precio
- Incluir emojis moderadamente
- Listo para copiar y enviar`,
  }

  const prompt = `Genera un post para ${platform.toUpperCase()} para este producto de suplementos:

Producto: ${product.name}
${product.description ? `Descripción: ${product.description}` : ''}
${product.brand ? `Marca: ${product.brand}` : ''}
${product.category ? `Categoría: ${product.category}` : ''}
Precio: $${product.price.toLocaleString('es-AR')}

Instrucciones específicas para ${platform}:
${platformInstructions[platform]}

Contexto: Tienda "Ultra Suplementos" en Paraná, Argentina. Instagram: @ultrasuplementospna

Post:`

  return chatCompletion([{ role: 'user', content: prompt }], {
    temperature: 0.8,
    maxTokens: 500,
  })
}

// Función para queries de dashboard en lenguaje natural
export async function generateSQLFromNaturalLanguage(
  question: string,
  availableTables: string
): Promise<{ sql: string; explanation: string }> {
  const prompt = `Eres un asistente que convierte preguntas en español a SQL para PostgreSQL.

Tablas disponibles:
${availableTables}

Pregunta del usuario: "${question}"

IMPORTANTE:
- Solo SELECT, nunca modificar datos
- Usar funciones de agregación cuando corresponda
- Formatear fechas en español
- Si la pregunta no se puede responder con los datos, explicar por qué

Responde SOLO con un JSON válido:
{
  "sql": "SELECT ...",
  "explanation": "Esta consulta obtiene..."
}

Si no puedes generar SQL válido:
{
  "sql": "",
  "explanation": "No puedo responder porque..."
}`

  const response = await chatCompletion([{ role: 'user', content: prompt }], {
    temperature: 0.1, // Bajo para respuestas más determinísticas
    maxTokens: 500,
  })

  try {
    // Limpiar posibles bloques de código markdown
    const cleanResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    return JSON.parse(cleanResponse)
  } catch {
    return {
      sql: '',
      explanation: 'Error al procesar la respuesta. Intentá reformular la pregunta.',
    }
  }
}
