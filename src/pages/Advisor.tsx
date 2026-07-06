import { useState } from 'react'
import { Send } from 'lucide-react'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { demoAdvisorMessages, type AdvisorMessage } from '../data/demoData'

export default function Advisor() {
  const guard = useRequireAuth()
  const [messages, setMessages] = useState<AdvisorMessage[]>(demoAdvisorMessages)
  const [draft, setDraft] = useState('')

  function sendMessage() {
    const text = draft.trim()
    if (!text) return
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content: text }])
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Advisor</h1>
        <p className="mt-1 text-ink-muted">Ask Finora anything about your money.</p>
      </div>

      <div className="card flex h-[28rem] flex-col p-0">
        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <p
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === 'user' ? 'bg-teal text-white' : 'bg-teal-tint text-ink'
                }`}
              >
                {m.content}
              </p>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            guard(sendMessage)
          }}
          className="flex items-center gap-3 border-t border-border p-4"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            type="text"
            placeholder="Ask about your spending, goals, or budget..."
            className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal text-white transition hover:bg-teal-dark"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
