'use client'

import { useState } from 'react'
import { Search, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { queryDashboardNaturalLanguage } from '../actions'

export function DashboardQueryInput() {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    data: unknown
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

    const {
      data,
      explanation,
      error: queryError,
    } = await queryDashboardNaturalLanguage(query)

    setIsLoading(false)

    if (queryError) {
      setError(queryError)
    } else {
      setResult({ data, explanation })
    }
  }

  const handleExampleClick = (example: string) => {
    setQuery(example)
  }

  // Helper para formatear valores en la tabla
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'number') {
      return value.toLocaleString('es-AR')
    }
    return String(value)
  }

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[#FF6B35]" />
        <div>
          <h3 className="font-semibold text-lg">Preguntale al Dashboard</h3>
          <p className="text-sm text-gray-500">
            Hacé preguntas en español sobre tu negocio
          </p>
        </div>
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
          className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] disabled:opacity-50 flex items-center gap-2 transition-colors"
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
            onClick={() => handleExampleClick(example)}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
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
                    {Object.keys(result.data[0] as object).map((key) => (
                      <th
                        key={key}
                        className="border px-3 py-2 text-left font-medium"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((row: unknown, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {Object.values(row as object).map(
                        (value: unknown, j: number) => (
                          <td key={j} className="border px-3 py-2">
                            {formatValue(value)}
                          </td>
                        )
                      )}
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
