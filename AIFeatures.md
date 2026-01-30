3# AI_FEATURES_SPEC.md

## Especificación de Features de IA para Ultra Suplementos ERP

Este documento es una guía completa para implementar features de inteligencia artificial en el ERP de Ultra Suplementos. Está diseñado para ser leído por Claude Code junto con el CLAUDE.md del proyecto.

---

## 🎯 Objetivo

Agregar 4 features de IA al ERP existente, **100% gratuitas** usando:
- **Groq API** (gratis, sin tarjeta de crédito requerida)
- **Supabase pgvector** (incluido en el free tier de Supabase)
- **Hugging Face** para embeddings gratuitos

---

## 📦 Stack Técnica a Usar

### APIs Gratuitas

| Servicio | Uso | Free Tier |
|----------|-----|-----------|
| **Groq** | LLM para chat, generación de texto | 14,400 requests/día, ilimitado |
| **Supabase pgvector** | Vector database para RAG | Incluido en free tier |
| **Hugging Face Inference** | Generar embeddings | Gratis para modelos pequeños |

### Modelos Recomendados

- **LLM**: `llama-3.3-70b-versatile` via Groq (gratis, muy rápido)
- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2` via Hugging Face (384 dimensiones, gratis)

---

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │ Chatbot  │ │ Desc Gen │ │ Dashboard│ │ Social Media Gen │   │
│  │   UI     │ │  Button  │ │  Query   │ │     Button       │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬─────────┘   │
└───────┼────────────┼────────────┼────────────────┼─────────────┘
        │            │            │                │
        ▼            ▼            ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER ACTIONS (Next.js)                    │
│  src/features/ai/actions.ts                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ chatWithAI() │ │ generateDesc │ │ queryDashboard│             │
│  │              │ │ ()           │ │ ()            │             │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘             │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVICIOS                                │
│  src/features/ai/services/                                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ groq.ts      │ │ embeddings.ts│ │ rag.ts       │             │
│  │ (LLM calls)  │ │ (HuggingFace)│ │ (vector      │             │
│  │              │ │              │ │  search)     │             │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘             │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL + pgvector)              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ products (tabla existente)                                │   │
│  │ + embedding vector(384)  ← nueva columna                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ match_products() ← función para búsqueda semántica       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📍 Ubicación de Componentes en la UI

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| **ChatWidget** | Layout del dashboard | Botón flotante visible en TODAS las páginas del dashboard |
| **GenerateDescriptionButton** | Formulario de productos | Junto al campo `description` en crear/editar producto |
| **SocialMediaGenerator** | `/dashboard/marketing` | Página dedicada para generar posts de RRSS |
| **DashboardQueryInput** | `/dashboard` (principal) | Widget/card en la página principal del dashboard |

---

## 📁 Estructura de Archivos a Crear

```
src/
├── features/
│   └── ai/
│       ├── actions.ts              # Server Actions principales
│       ├── services/
│       │   ├── groq.ts             # Cliente Groq API
│       │   ├── embeddings.ts       # Generación de embeddings
│       │   └── rag.ts              # Lógica RAG (Retrieval)
│       ├── components/
│       │   ├── ChatWidget.tsx      # Widget de chat flotante (→ layout dashboard)
│       │   ├── ChatMessages.tsx    # Lista de mensajes
│       │   ├── ChatInput.tsx       # Input del chat
│       │   ├── GenerateDescriptionButton.tsx  # (→ form productos)
│       │   ├── DashboardQueryInput.tsx        # (→ dashboard principal)
│       │   └── SocialMediaGenerator.tsx       # (→ /dashboard/marketing)
│       ├── hooks/
│       │   └── useChat.ts          # Hook para manejar estado del chat
│       └── types/
│           └── index.ts            # Tipos TypeScript
│
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           ├── page.tsx            # Agregar DashboardQueryInput aquí
│           └── marketing/          # NUEVA página para marketing/RRSS
│               └── page.tsx
│
supabase/
└── migrations/
    └── 20260120000001_ai_embeddings.sql  # Migración para pgvector
```

---

## 🗄️ Migración de Base de Datos

### Archivo: `supabase/migrations/20260120000001_ai_embeddings.sql`

```sql
-- =============================================================================
-- MIGRACIÓN: Habilitar pgvector y agregar embeddings a productos
-- =============================================================================

-- 1. Habilitar extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Agregar columna de embedding a productos
-- Usamos 384 dimensiones (modelo all-MiniLM-L6-v2 de HuggingFace)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS embedding vector(384);

-- 3. Crear índice HNSW para búsquedas eficientes
-- HNSW es más rápido que IVFFlat para datasets pequeños/medianos
CREATE INDEX IF NOT EXISTS products_embedding_idx 
ON products 
USING hnsw (embedding vector_cosine_ops);

-- 4. Función para búsqueda semántica de productos
CREATE OR REPLACE FUNCTION match_products(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  brand text,
  category_id uuid,
  price decimal,
  cost_price decimal,
  stock int,
  min_stock int,
  barcode text,
  expiration_date date,
  is_active boolean,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.description,
    p.brand,
    p.category_id,
    p.price,
    p.cost_price,
    p.stock,
    p.min_stock,
    p.barcode,
    p.expiration_date,
    p.is_active,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM products p
  WHERE 
    p.embedding IS NOT NULL
    AND p.is_active = true
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Función para obtener contexto de productos para el chatbot
CREATE OR REPLACE FUNCTION get_products_context(
  query_embedding vector(384),
  max_products int DEFAULT 10
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  context text := '';
  product_row record;
BEGIN
  FOR product_row IN
    SELECT 
      p.name,
      p.description,
      p.brand,
      c.name as category_name,
      p.price,
      p.stock,
      p.expiration_date
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.embedding IS NOT NULL AND p.is_active = true
    ORDER BY p.embedding <=> query_embedding
    LIMIT max_products
  LOOP
    context := context || format(
      E'- **%s** (%s): %s. Marca: %s. Precio: $%s. Stock: %s unidades.%s\n',
      product_row.name,
      COALESCE(product_row.category_name, 'Sin categoría'),
      COALESCE(product_row.description, 'Sin descripción'),
      COALESCE(product_row.brand, 'Sin marca'),
      product_row.price,
      product_row.stock,
      CASE 
        WHEN product_row.expiration_date IS NOT NULL 
        THEN format(' Vence: %s.', product_row.expiration_date)
        ELSE ''
      END
    );
  END LOOP;
  
  RETURN context;
END;
$$;

-- 6. Trigger para limpiar embedding cuando cambia el producto
-- (el embedding se regenerará en el próximo sync)
CREATE OR REPLACE FUNCTION clear_product_embedding()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.name IS DISTINCT FROM NEW.name 
     OR OLD.description IS DISTINCT FROM NEW.description 
     OR OLD.brand IS DISTINCT FROM NEW.brand THEN
    NEW.embedding := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_clear_product_embedding ON products;
CREATE TRIGGER trigger_clear_product_embedding
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION clear_product_embedding();

-- 7. Función SEGURA para ejecutar queries de solo lectura (Dashboard IA)
-- IMPORTANTE: Esta función tiene validaciones de seguridad para prevenir SQL injection
CREATE OR REPLACE FUNCTION execute_readonly_query(query_text text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET statement_timeout = '5s'
AS $$
DECLARE
  result json;
  normalized_query text;
BEGIN
  -- Normalizar query para validación
  normalized_query := UPPER(TRIM(query_text));

  -- Validar que sea SELECT
  IF NOT (normalized_query LIKE 'SELECT%') THEN
    RAISE EXCEPTION 'Solo se permiten consultas SELECT';
  END IF;

  -- Validar que no tenga palabras peligrosas (SQL injection prevention)
  IF query_text ~* '\b(DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE|GRANT|REVOKE|CREATE|EXECUTE|INTO)\b' THEN
    RAISE EXCEPTION 'Consulta contiene operaciones no permitidas';
  END IF;

  -- Validar que no tenga comentarios SQL (posible bypass)
  IF query_text ~ '(--|/\*|\*/)' THEN
    RAISE EXCEPTION 'Consulta contiene comentarios no permitidos';
  END IF;

  -- Ejecutar query y retornar como JSON
  EXECUTE format('SELECT COALESCE(json_agg(t), ''[]''::json) FROM (%s) t', query_text) INTO result;

  RETURN result;
EXCEPTION
  WHEN query_canceled THEN
    RAISE EXCEPTION 'Consulta cancelada por timeout (máximo 5 segundos)';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error en consulta: %', SQLERRM;
END;
$$;

-- 8. Revocar permisos directos y solo permitir via función
-- (La función usa SECURITY DEFINER para ejecutar con permisos del owner)
REVOKE EXECUTE ON FUNCTION execute_readonly_query(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION execute_readonly_query(text) TO authenticated;
```

---

## 🔧 Variables de Entorno

### Agregar a `.env.local`:

```env
# AI Services (todas gratuitas)
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx

# Opcional: para debug
AI_DEBUG=false
```

### Obtener API Keys:

1. **Groq**: https://console.groq.com → Create API Key (gratis, sin tarjeta)
2. **Hugging Face**: https://huggingface.co/settings/tokens → Create token (gratis)

---

## 📝 Implementación Detallada

### 1. Servicio Groq (LLM)

**Archivo: `src/features/ai/services/groq.ts`**

```typescript
import OpenAI from 'openai'

// Groq usa la misma interfaz que OpenAI
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: {
    temperature?: number
    maxTokens?: number
  }
): Promise<string> {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1024,
  })

  return response.choices[0]?.message?.content ?? ''
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
    return JSON.parse(response)
  } catch {
    return {
      sql: '',
      explanation: 'Error al procesar la respuesta. Intentá reformular la pregunta.',
    }
  }
}
```

### 2. Servicio de Embeddings

**Archivo: `src/features/ai/services/embeddings.ts`**

```typescript
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2'

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(HUGGINGFACE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: text,
      options: { wait_for_model: true },
    }),
  })

  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.status}`)
  }

  const embedding = await response.json()
  
  // El modelo retorna un array de 384 dimensiones
  return embedding as number[]
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await fetch(HUGGINGFACE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: texts,
      options: { wait_for_model: true },
    }),
  })

  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.status}`)
  }

  return response.json()
}

// Función helper para crear el texto a embeddear de un producto
export function createProductEmbeddingText(product: {
  name: string
  description?: string | null
  brand?: string | null
  categoryName?: string | null
}): string {
  const parts = [
    product.name,
    product.brand,
    product.categoryName,
    product.description,
  ].filter(Boolean)

  return parts.join('. ')
}
```

### 3. Servicio RAG

**Archivo: `src/features/ai/services/rag.ts`**

```typescript
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
  const { data: stats } = await supabase
    .from('products')
    .select('id', { count: 'exact' })
    .eq('is_active', true)
  
  const totalProducts = stats?.length ?? 0

  // 4. Construir el prompt del sistema
  const systemPrompt = `Eres el asistente virtual de Ultra Suplementos, una tienda de suplementos deportivos ubicada en 25 de mayo 347, Paraná, Argentina.

Instagram: @ultrasuplementospna

Tu rol:
- Ayudar a clientes a encontrar productos
- Responder preguntas sobre suplementos
- Recomendar productos basándote en los objetivos del cliente
- Ser amigable y usar español argentino

Información del catálogo (${totalProducts} productos activos):
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
```

### 4. Server Actions

**Archivo: `src/features/ai/actions.ts`**

```typescript
'use server'

import { createServerActionClient } from '@/core/infrastructure/supabase/client'
import { revalidatePath } from 'next/cache'
import { 
  generateProductDescription, 
  generateSocialPost,
  generateSQLFromNaturalLanguage 
} from './services/groq'
import { generateEmbedding, createProductEmbeddingText } from './services/embeddings'
import { chatWithProductContext, searchProductsByQuery } from './services/rag'
import { ChatMessage } from './services/groq'

// =============================================================================
// CHATBOT
// =============================================================================

export async function sendChatMessage(
  message: string,
  history: ChatMessage[]
): Promise<{ response: string; error?: string }> {
  try {
    const response = await chatWithProductContext(message, history)
    return { response }
  } catch (error) {
    console.error('Chat error:', error)
    return { 
      response: '', 
      error: 'Hubo un error al procesar tu mensaje. Por favor intentá de nuevo.' 
    }
  }
}

// =============================================================================
// GENERADOR DE DESCRIPCIONES
// =============================================================================

export async function generateAndSaveDescription(productId: string): Promise<{
  description: string
  error?: string
}> {
  try {
    const supabase = await createServerActionClient()
    
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
      category: product.category?.name ?? undefined,
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
    return { 
      description: '', 
      error: 'Error al generar la descripción' 
    }
  }
}

// =============================================================================
// GENERADOR DE POSTS PARA REDES SOCIALES
// =============================================================================

export async function generateProductSocialPost(
  productId: string,
  platform: 'instagram' | 'facebook' | 'whatsapp'
): Promise<{ post: string; error?: string }> {
  try {
    const supabase = await createServerActionClient()
    
    const { data: product, error } = await supabase
      .from('products')
      .select('name, description, brand, price, category:categories(name)')
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
        category: product.category?.name ?? undefined,
        price: product.price,
      },
      platform
    )

    return { post }
  } catch (error) {
    console.error('Error generating social post:', error)
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

export async function queryDashboardNaturalLanguage(
  question: string
): Promise<{ data: any; explanation: string; error?: string }> {
  try {
    const supabase = await createServerActionClient()
    
    // 1. Convertir pregunta a SQL
    const { sql, explanation } = await generateSQLFromNaturalLanguage(
      question,
      AVAILABLE_TABLES
    )

    if (!sql) {
      return { data: null, explanation, error: explanation }
    }

    // 2. Validar que es un SELECT (seguridad)
    const normalizedSQL = sql.trim().toUpperCase()
    if (!normalizedSQL.startsWith('SELECT')) {
      return { 
        data: null, 
        explanation: '', 
        error: 'Solo se permiten consultas de lectura (SELECT)' 
      }
    }

    // 3. Ejecutar query
    const { data, error } = await supabase.rpc('execute_readonly_query', {
      query_text: sql
    })

    // Si no existe la función RPC, usar query directa (menos seguro)
    // const { data, error } = await supabase.from('products').select(sql)

    if (error) {
      console.error('Query error:', error)
      return { 
        data: null, 
        explanation: '', 
        error: `Error en la consulta: ${error.message}` 
      }
    }

    return { data, explanation }
  } catch (error) {
    console.error('Dashboard query error:', error)
    return { 
      data: null, 
      explanation: '', 
      error: 'Error al procesar la consulta' 
    }
  }
}

// =============================================================================
// SINCRONIZACIÓN DE EMBEDDINGS
// =============================================================================

export async function syncProductEmbeddings(): Promise<{
  synced: number
  errors: number
}> {
  const supabase = await createServerActionClient()
  
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
        categoryName: product.category?.name,
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
      await new Promise(resolve => setTimeout(resolve, 100))
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

export async function searchProducts(query: string) {
  try {
    const products = await searchProductsByQuery(query, 10)
    return { products, error: null }
  } catch (error) {
    console.error('Search error:', error)
    return { products: [], error: 'Error al buscar productos' }
  }
}
```

### 5. Tipos TypeScript

**Archivo: `src/features/ai/types/index.ts`**

```typescript
export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export type ChatState = {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
}

export type SocialPlatform = 'instagram' | 'facebook' | 'whatsapp'

export type DashboardQueryResult = {
  data: any
  explanation: string
  error?: string
}

export type ProductWithSimilarity = {
  id: string
  name: string
  description: string | null
  brand: string | null
  category_id: string | null
  price: number
  cost_price: number
  stock: number
  min_stock: number
  barcode: string | null
  expiration_date: string | null
  is_active: boolean
  similarity: number
}
```

### 6. Hook de Chat

**Archivo: `src/features/ai/hooks/useChat.ts`**

```typescript
'use client'

import { useState, useCallback } from 'react'
import { ChatMessage, ChatState } from '../types'
import { sendChatMessage } from '../actions'

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  })

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }))

    // Preparar historial para la API (sin id ni timestamp)
    const history = state.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const { response, error } = await sendChatMessage(content, history)

    if (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error,
      }))
      return
    }

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, assistantMessage],
      isLoading: false,
    }))
  }, [state.messages])

  const clearChat = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
    })
  }, [])

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    clearChat,
  }
}
```

### 7. Componente Widget de Chat

**Archivo: `src/features/ai/components/ChatWidget.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { MessageCircle, X, Send, Loader2, Trash2 } from 'lucide-react'
import { useChat } from '../hooks/useChat'
import { cn } from '@/lib/utils'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const { messages, isLoading, error, sendMessage, clearChat } = useChat()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage(input.trim())
    setInput('')
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all',
          'bg-[#FF6B35] hover:bg-[#e55a2b] text-white',
          isOpen && 'rotate-90'
        )}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Panel de chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-lg shadow-xl border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-[#FF6B35] text-white rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Asistente Ultra</h3>
              <p className="text-xs text-white/80">¿En qué puedo ayudarte?</p>
            </div>
            <button 
              onClick={clearChat}
              className="p-2 hover:bg-white/20 rounded"
              title="Limpiar chat"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-sm">
                  ¡Hola! Soy el asistente de Ultra Suplementos.
                  <br />
                  Preguntame sobre productos, precios o recomendaciones.
                </p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'max-w-[80%] p-3 rounded-lg',
                  message.role === 'user'
                    ? 'ml-auto bg-[#FF6B35] text-white'
                    : 'bg-gray-100 text-gray-800'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString('es-AR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Escribiendo...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribí tu mensaje..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
```

### 8. Botón Generar Descripción

**Archivo: `src/features/ai/components/GenerateDescriptionButton.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { generateAndSaveDescription } from '../actions'

type Props = {
  productId: string
  onGenerated?: (description: string) => void
}

export function GenerateDescriptionButton({ productId, onGenerated }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    const { description, error } = await generateAndSaveDescription(productId)
    setIsLoading(false)

    if (!error && description) {
      onGenerated?.(description)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Sparkles size={16} />
      )}
      {isLoading ? 'Generando...' : 'Generar con IA'}
    </button>
  )
}
```

### 9. Generador de Posts para Redes

**Archivo: `src/features/ai/components/SocialMediaGenerator.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Instagram, Facebook, MessageCircle, Copy, Check, Loader2 } from 'lucide-react'
import { generateProductSocialPost } from '../actions'
import { SocialPlatform } from '../types'
import { cn } from '@/lib/utils'

type Props = {
  productId: string
  productName: string
}

const platforms: { id: SocialPlatform; name: string; icon: typeof Instagram }[] = [
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'facebook', name: 'Facebook', icon: Facebook },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle },
]

export function SocialMediaGenerator({ productId, productName }: Props) {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('instagram')
  const [generatedPost, setGeneratedPost] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setIsLoading(true)
    setError('')
    
    const { post, error: genError } = await generateProductSocialPost(
      productId,
      selectedPlatform
    )
    
    setIsLoading(false)
    
    if (genError) {
      setError(genError)
    } else {
      setGeneratedPost(post)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPost)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h4 className="font-medium">Generar post para redes</h4>
      
      {/* Selector de plataforma */}
      <div className="flex gap-2">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setSelectedPlatform(platform.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded border transition-colors',
              selectedPlatform === platform.id
                ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <platform.icon size={18} />
            {platform.name}
          </button>
        ))}
      </div>

      {/* Botón generar */}
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full py-2 bg-[#FF6B35] text-white rounded hover:bg-[#e55a2b] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Generando post...
          </>
        ) : (
          'Generar post'
        )}
      </button>

      {/* Error */}
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      {/* Post generado */}
      {generatedPost && (
        <div className="relative">
          <div className="bg-gray-50 rounded p-4 whitespace-pre-wrap text-sm">
            {generatedPost}
          </div>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 bg-white rounded border hover:bg-gray-50"
            title="Copiar"
          >
            {copied ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
      )}
    </div>
  )
}
```

### 10. Input para Queries del Dashboard

**Archivo: `src/features/ai/components/DashboardQueryInput.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import { queryDashboardNaturalLanguage } from '../actions'

export function DashboardQueryInput() {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    data: any
    explanation: string
  } | null>(null)
  const [error, setError] = useState('')

  const exampleQueries = [
    '¿Cuánto vendí este mes?',
    '¿Cuáles son los productos con stock bajo?',
    '¿Cuál es el producto más vendido?',
    '¿Cuántos clientes tengo registrados?',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

    setIsLoading(true)
    setError('')
    setResult(null)

    const { data, explanation, error: queryError } = await queryDashboardNaturalLanguage(query)

    setIsLoading(false)

    if (queryError) {
      setError(queryError)
    } else {
      setResult({ data, explanation })
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-lg mb-1">Preguntale al Dashboard</h3>
        <p className="text-sm text-gray-500">
          Hacé preguntas en español sobre tu negocio
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej: ¿Cuánto vendí esta semana?"
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
        </button>
      </form>

      {/* Ejemplos */}
      <div className="flex flex-wrap gap-2">
        {exampleQueries.map((example) => (
          <button
            key={example}
            onClick={() => setQuery(example)}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          >
            {example}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 italic">{result.explanation}</p>
          
          {Array.isArray(result.data) && result.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    {Object.keys(result.data[0]).map((key) => (
                      <th key={key} className="border px-3 py-2 text-left font-medium">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {Object.values(row).map((value: any, j: number) => (
                        <td key={j} className="border px-3 py-2">
                          {typeof value === 'number' 
                            ? value.toLocaleString('es-AR')
                            : String(value ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded text-center text-gray-500">
              No se encontraron resultados
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

---

## 📦 Dependencias a Instalar

```bash
npm install openai
```

> **Nota**: Usamos `openai` porque Groq usa la misma API. No es necesario instalar un cliente específico de Groq.

---

## 🚀 Pasos de Implementación

### Orden recomendado:

1. **Configuración inicial**
   - Agregar variables de entorno
   - Crear migración de base de datos
   - Ejecutar migración en Supabase

2. **Servicios base**
   - `groq.ts`
   - `embeddings.ts`
   - `rag.ts`

3. **Server Actions**
   - `actions.ts`

4. **Componentes UI**
   - `ChatWidget.tsx` → agregar al layout del dashboard (flotante en todas las páginas)
   - `GenerateDescriptionButton.tsx` → agregar al formulario crear/editar productos
   - `DashboardQueryInput.tsx` → agregar a página principal del dashboard
   - Crear página `/dashboard/marketing` con `SocialMediaGenerator.tsx`

5. **Testing manual**
   - Probar chat con productos
   - Probar generación de descripciones
   - Probar posts de redes
   - Probar queries de dashboard

---

## 🧪 Testing

### Preguntas de prueba para el chatbot:

```
- "¿Tenés proteína de suero?"
- "¿Qué me recomendás para ganar masa muscular?"
- "¿Cuánto sale la creatina?"
- "¿Tienen BCAA?"
```

### Queries de prueba para dashboard:

```
- "¿Cuánto vendí hoy?"
- "¿Cuáles son los 5 productos más vendidos?"
- "¿Cuántos productos tengo con stock bajo?"
- "¿Cuál fue mi mejor día de ventas este mes?"
```

---

## ⚠️ Limitaciones y Consideraciones

### Free Tier Limits

| Servicio | Límite | Estrategia |
|----------|--------|------------|
| Groq | 14,400 req/día | Suficiente para uso normal |
| HuggingFace | Rate limited | Procesar embeddings en batches |
| Supabase | 500MB storage | Suficiente para miles de productos |

### Recomendaciones

1. **Embeddings**: Sincronizar en background, no en cada request
2. **Chat**: Limitar historial a últimos 6 mensajes
3. **Dashboard queries**: Cachear resultados frecuentes
4. **Rate limiting**: Implementar throttling en el frontend

---

## 📚 Recursos

- [Groq Documentation](https://console.groq.com/docs)
- [Supabase pgvector Guide](https://supabase.com/docs/guides/ai/vector-columns)
- [HuggingFace Inference API](https://huggingface.co/docs/api-inference)
- [LangChain JS (opcional para futuro)](https://js.langchain.com)

---

## 🔒 Consideraciones de Seguridad

### SQL Injection en Dashboard Queries
La función `execute_readonly_query` tiene múltiples capas de protección:
- Solo permite `SELECT` (valida al inicio de la query)
- Bloquea palabras clave peligrosas (DROP, DELETE, UPDATE, INSERT, etc.)
- Bloquea comentarios SQL (`--`, `/*`, `*/`)
- Timeout de 5 segundos para prevenir queries costosas
- Usa `SECURITY DEFINER` con permisos controlados

### API Keys
- Las keys de Groq y HuggingFace NUNCA se exponen al cliente
- Todas las llamadas a IA pasan por Server Actions

### Rate Limiting
Considerar implementar rate limiting adicional si el uso crece:
- Limitar mensajes de chat por usuario/minuto
- Limitar generaciones de descripción por producto
- Cachear embeddings para evitar regeneraciones innecesarias

---

## ✅ Checklist Final

### Configuración
- [ ] Variables de entorno configuradas (GROQ_API_KEY, HUGGINGFACE_API_KEY)
- [ ] Migración ejecutada en Supabase
- [ ] Extensión pgvector habilitada
- [ ] Función `execute_readonly_query` creada

### Servicios
- [ ] `groq.ts` implementado
- [ ] `embeddings.ts` implementado
- [ ] `rag.ts` implementado
- [ ] `actions.ts` con todas las Server Actions

### Componentes UI
- [ ] `ChatWidget.tsx` agregado al layout del dashboard
- [ ] `GenerateDescriptionButton.tsx` en formulario de productos
- [ ] `DashboardQueryInput.tsx` en página principal dashboard
- [ ] Página `/dashboard/marketing` con `SocialMediaGenerator.tsx`

### Integración
- [ ] Ruta `/dashboard/marketing` agregada a navegación/sidebar
- [ ] Embeddings sincronizados para productos existentes

### Testing
- [ ] Chat responde con contexto de productos
- [ ] Generación de descripciones funciona
- [ ] Posts de redes se generan correctamente
- [ ] Queries de dashboard retornan datos
