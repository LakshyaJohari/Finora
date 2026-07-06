import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Single gating mechanism for write actions across the app.
 * If the user is signed in, runs `action` immediately.
 * Otherwise stashes `action` and redirects to /login, which resumes
 * it (via consumePendingAction) once sign-in succeeds.
 */
export function useRequireAuth() {
  const { user, setPendingAction } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return function guard(action: () => void) {
    if (user) {
      action()
      return
    }
    setPendingAction(action)
    const redirect = encodeURIComponent(location.pathname + location.search)
    navigate(`/login?redirect=${redirect}`)
  }
}
