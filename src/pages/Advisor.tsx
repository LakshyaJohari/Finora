import { useState } from 'react'
import { Send } from 'lucide-react'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { useAdvisorChat } from '../hooks/useAdvisorChat'

export default function Advisor() {
  const guard = useRequireAuth()
  const { messages, sending, error, sendMessage } = useAdvisorChat()
  const [draft, setDraft] = useState('')

  function submit() {
    const text = draft.trim()
    if (!text) return
    setDraft('')
    sendMessage(text)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Advisor</h1>
        <p className="mt-1 text-ink-muted">Ask Finora anything about your money.</p>
      </div>

      <div className="card flex h-[28rem] flex-col p-0">
        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {messages.length === 0 && (
            <p className="text-center text-sm text-ink-muted">
              Ask about your spending, goals, or whether you can afford something - answers are
              grounded in your real numbers.
            </p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <p
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === 'user' ? 'bg-teal text-white' : 'bg-teal-tint text-ink'
                }`}
              >
                {m.content}
              </p>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <p className="rounded-2xl bg-teal-tint px-4 py-2.5 text-sm text-ink-muted">Thinking…</p>
            </div>
          )}
        </div>

        {error && (
          <p className="mx-4 mb-2 rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            guard(submit)
          }}
          className="flex items-center gap-3 border-t border-border p-4"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            type="text"
            placeholder="Ask about your spending, goals, or budget..."
            disabled={sending}
            className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted disabled:opacity-50"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={sending || !draft.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal text-white transition hover:bg-teal-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
