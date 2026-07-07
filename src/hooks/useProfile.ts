import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Profile } from '../types'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      setError(error.message)
    } else {
      setProfile(data as Profile | null)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function updateProfile(patch: Partial<Pick<Profile, 'full_name' | 'avatar_url'>>) {
    if (!user) throw new Error('Must be signed in to update your profile')
    const { data, error } = await supabase.from('profiles').update(patch).eq('id', user.id).select().single()
    if (error) throw new Error(error.message)
    setProfile(data as Profile)
    return data as Profile
  }

  return { profile, loading, error, refetch, updateProfile }
}
