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
  data: unknown
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

export type GenerateDescriptionResult = {
  description: string
  error?: string
}

export type GenerateSocialPostResult = {
  post: string
  error?: string
}

export type SyncEmbeddingsResult = {
  synced: number
  errors: number
}
