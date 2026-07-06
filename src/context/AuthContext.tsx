import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithPassword: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  /** Stash an action to run once the user finishes signing in. */
  setPendingAction: (action: () => void) => void
  /** Run and clear the stashed action, if any. */
  consumePendingAction: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const pendingActionRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signInWithPassword: AuthContextValue['signInWithPassword'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUpWithPassword: AuthContextValue['signUpWithPassword'] = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { error: error?.message ?? null, needsConfirmation: !error && !data.session }
  }

  const signInWithGoogle: AuthContextValue['signInWithGoogle'] = async (redirectPath) => {
    const target = redirectPath
      ? `${window.location.origin}/login?redirect=${encodeURIComponent(redirectPath)}`
      : window.location.origin
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: target },
    })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const setPendingAction = (action: () => void) => {
    pendingActionRef.current = action
  }

  const consumePendingAction = () => {
    const action = pendingActionRef.current
    pendingActionRef.current = null
    if (action) action()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithPassword,
        signUpWithPassword,
        signInWithGoogle,
        signOut,
        setPendingAction,
        consumePendingAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
