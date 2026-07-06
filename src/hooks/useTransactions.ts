import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Transaction } from '../types'

export type NewTransaction = Omit<
  Transaction,
  'id' | 'user_id' | 'created_at' | 'currency' | 'ai_category_reasoning'
> &
  Partial<Pick<Transaction, 'currency' | 'ai_category_reasoning'>>

export function useTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!user) {
      setTransactions([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setTransactions(data as Transaction[])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function addTransaction(input: NewTransaction) {
    if (!user) throw new Error('Must be signed in to add a transaction')
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...input, user_id: user.id })
      .select()
      .single()
    if (error) throw new Error(error.message)
    setTransactions((prev) =>
      [data as Transaction, ...prev].sort((a, b) => b.transaction_date.localeCompare(a.transaction_date)),
    )
    return data as Transaction
  }

  async function bulkInsertTransactions(inputs: NewTransaction[]) {
    if (!user) throw new Error('Must be signed in to import transactions')
    if (inputs.length === 0) return [] as Transaction[]
    const { data, error } = await supabase
      .from('transactions')
      .insert(inputs.map((input) => ({ ...input, user_id: user.id })))
      .select()
    if (error) throw new Error(error.message)
    await refetch()
    return data as Transaction[]
  }

  async function updateTransaction(id: string, patch: Partial<NewTransaction>) {
    const { data, error } = await supabase
      .from('transactions')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    setTransactions((prev) => prev.map((t) => (t.id === id ? (data as Transaction) : t)))
    return data as Transaction
  }

  return { transactions, loading, error, refetch, addTransaction, bulkInsertTransactions, updateTransaction }
}
