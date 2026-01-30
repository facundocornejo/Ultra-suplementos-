'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Trash2 } from 'lucide-react'
import { useChat } from '../hooks/useChat'
import { cn } from '@/lib/utils'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const { messages, isLoading, error, sendMessage, clearChat } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
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
                <MessageCircle
                  size={48}
                  className="mx-auto mb-4 text-gray-300"
                />
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
                    minute: '2-digit',
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

            <div ref={messagesEndRef} />
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
