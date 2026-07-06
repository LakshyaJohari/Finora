import type { ButtonHTMLAttributes } from 'react'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { Button } from './Button'

interface RequireAuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  action: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
}

/**
 * Drop-in replacement for <Button> when the click performs a write action
 * (add/edit/save/send). Gates through the same useRequireAuth mechanism
 * used everywhere else, so guests get redirected to /login and land back
 * here with the action resumed.
 */
export function RequireAuthButton({ action, onClick, ...props }: RequireAuthButtonProps) {
  const guard = useRequireAuth()

  return (
    <Button
      {...props}
      onClick={(event) => {
        onClick?.(event)
        guard(action)
      }}
    />
  )
}
