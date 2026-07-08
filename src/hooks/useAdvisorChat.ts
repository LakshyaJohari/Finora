import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useTransactions } from './useTransactions'
import { useGoals } from './useGoals'
import { buildAdvisorContext } from '../lib/advisorContext'
import { fetchAdvisorReply } from '../lib/advisor'
import type { ChatMessage } from '../types'

const HISTORY_LIMIT = 10

export function useAdvisorChat() {
  const { user } = useAuth()
  const { transactions } = useTransactions()
  const { goals } = useGoals()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setMessages([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error) setMessages((data ?? []) as ChatMessage[])
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !content.trim() || sending) return
      setSending(true)
      setError(null)

      const { data: userRow, error: insertError } = await supabase
        .from('chat_messages')
        .insert({ user_id: user.id, role: 'user', content: content.trim() })
        .select()
        .single()

      if (insertError || !userRow) {
        setError("Couldn't send that message. Try again in a moment.")
        setSending(false)
        return
      }
      setMessages((prev) => [...prev, userRow as ChatMessage])

      const context = buildAdvisorContext(transactions, goals)
      const history = [...messages, userRow as ChatMessage]
        .slice(-HISTORY_LIMIT)
        .map((m) => ({ role: m.role, content: m.content }))

      const reply = await fetchAdvisorReply(context, history, content.trim())

      if (!reply) {
        setError("The advisor couldn't respond just now - your message was saved, so you can try asking again.")
        setSending(false)
        return
      }

      const { data: assistantRow, error: assistantError } = await supabase
        .from('chat_messages')
        .insert({ user_id: user.id, role: 'assistant', content: reply })
        .select()
        .single()

      if (!assistantError && assistantRow) {
        setMessages((prev) => [...prev, assistantRow as ChatMessage])
      }
      setSending(false)
    },
    [user, transactions, goals, messages, sending],
  )

  const clearChat = useCallback(async () => {
    if (!user) return
    const previous = messages
    setMessages([])
    setError(null)
    const { error: deleteError } = await supabase.from('chat_messages').delete().eq('user_id', user.id)
    if (deleteError) {
      setMessages(previous)
      setError("Couldn't clear the conversation. Try again in a moment.")
    }
  }, [user, messages])

  return { messages, loading, sending, error, sendMessage, clearChat, transactions }
}
