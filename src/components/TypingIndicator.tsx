import './TypingIndicator.css'

export function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1.5 rounded-2xl border border-border bg-surface px-4 py-3">
      <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-ink-muted" />
      <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-ink-muted" />
      <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-ink-muted" />
    </div>
  )
}
