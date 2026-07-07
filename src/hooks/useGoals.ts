import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Goal } from '../types'

export type NewGoal = Omit<Goal, 'id' | 'user_id' | 'created_at'>

export function useGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!user) {
      setGoals([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setGoals(data as Goal[])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function addGoal(input: NewGoal) {
    if (!user) throw new Error('Must be signed in to add a goal')
    const { data, error } = await supabase
      .from('goals')
      .insert({ ...input, user_id: user.id })
      .select()
      .single()
    if (error) throw new Error(error.message)
    setGoals((prev) => [...prev, data as Goal])
    return data as Goal
  }

  async function updateGoal(id: string, patch: Partial<NewGoal>) {
    const { data, error } = await supabase.from('goals').update(patch).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    setGoals((prev) => prev.map((g) => (g.id === id ? (data as Goal) : g)))
    return data as Goal
  }

  async function deleteGoal(id: string) {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (error) throw new Error(error.message)
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  return { goals, loading, error, refetch, addGoal, updateGoal, deleteGoal }
}
