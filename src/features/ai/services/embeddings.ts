const HUGGINGFACE_API_URL =
  'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction'

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(HUGGINGFACE_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: text,
      options: { wait_for_model: true },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`)
  }

  const embedding = await response.json()

  // El modelo retorna un array de 384 dimensiones
  return embedding as number[]
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await fetch(HUGGINGFACE_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: texts,
      options: { wait_for_model: true },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`)
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
