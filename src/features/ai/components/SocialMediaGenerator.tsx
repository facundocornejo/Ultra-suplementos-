'use client'

import { useState } from 'react'
import {
  Instagram,
  Facebook,
  MessageCircle,
  Copy,
  Check,
  Loader2,
} from 'lucide-react'
import { generateProductSocialPost } from '../actions'
import { SocialPlatform } from '../types'
import { cn } from '@/lib/utils'

type Props = {
  productId: string
  productName: string
}

const platforms: {
  id: SocialPlatform
  name: string
  icon: typeof Instagram
  color: string
}[] = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'text-green-600' },
]

export function SocialMediaGenerator({ productId, productName }: Props) {
  const [selectedPlatform, setSelectedPlatform] =
    useState<SocialPlatform>('instagram')
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
    <div className="border rounded-lg p-6 space-y-4 bg-white">
      <div>
        <h4 className="font-semibold text-lg">Generar post para redes</h4>
        <p className="text-sm text-gray-500">
          Producto: <span className="font-medium">{productName}</span>
        </p>
      </div>

      {/* Selector de plataforma */}
      <div className="flex gap-2">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => {
              setSelectedPlatform(platform.id)
              setGeneratedPost('')
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
              selectedPlatform === platform.id
                ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <platform.icon size={18} className={platform.color} />
            {platform.name}
          </button>
        ))}
      </div>

      {/* Botón generar */}
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Generando post para {platforms.find((p) => p.id === selectedPlatform)?.name}...
          </>
        ) : (
          'Generar post'
        )}
      </button>

      {/* Error */}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Post generado */}
      {generatedPost && (
        <div className="relative">
          <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-sm border">
            {generatedPost}
          </div>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
            title="Copiar al portapapeles"
          >
            {copied ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <Copy size={16} />
            )}
          </button>
          {copied && (
            <span className="absolute top-2 right-12 text-xs text-green-600 bg-white px-2 py-1 rounded">
              ¡Copiado!
            </span>
          )}
        </div>
      )}
    </div>
  )
}
