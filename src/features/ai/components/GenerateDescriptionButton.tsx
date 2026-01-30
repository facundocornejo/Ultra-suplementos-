'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { generateAndSaveDescription } from '../actions'

type Props = {
  productId: string
  onGenerated?: (description: string) => void
  className?: string
}

export function GenerateDescriptionButton({
  productId,
  onGenerated,
  className,
}: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setIsLoading(true)
    setError(null)

    const { description, error: genError } =
      await generateAndSaveDescription(productId)

    setIsLoading(false)

    if (genError) {
      setError(genError)
      return
    }

    if (description) {
      onGenerated?.(description)
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50 transition-colors"
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Sparkles size={16} />
        )}
        {isLoading ? 'Generando...' : 'Generar con IA'}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
