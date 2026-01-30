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

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date(),
      }

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null,
      }))

      // Preparar historial para la API (sin id ni timestamp)
      const history = state.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

      const { response, error } = await sendChatMessage(content, history)

      if (error) {
        setState((prev) => ({
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

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }))
    },
    [state.messages]
  )

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
