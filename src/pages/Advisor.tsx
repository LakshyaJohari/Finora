import { useEffect, useRef, useState } from 'react'
import { Send, RotateCcw } from 'lucide-react'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { useAdvisorChat } from '../hooks/useAdvisorChat'
import { GroundedText } from '../components/GroundedText'
import { TypingIndicator } from '../components/TypingIndicator'
import { RequireAuthButton } from '../components/RequireAuth'
import { HistoryPanel } from '../components/HistoryPanel'

const SUGGESTED_PROMPTS = [
  'Can I afford a $500 purchase?',
  "How's my health score looking?",
  'Should I adjust my goal savings?',
  'Why did my spending change this month?',
]

export default function Advisor() {
  const guard = useRequireAuth()
  const { messages, loading, sending, error, sendMessage, clearChat, transactions } = useAdvisorChat()
  const [draft, setDraft] = useState('')
  const [confirmingClear, setConfirmingClear] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, sending])

  function submit(text: string) {
    if (!text.trim()) return
    setDraft('')
    sendMessage(text)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Advisor</h1>
        <p className="mt-1 text-ink-muted">Ask Finora anything about your money.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card flex h-[32rem] flex-col p-0 lg:col-span-2">
          {messages.length > 0 && (
            <div className="flex items-center justify-end gap-2 border-b border-border px-4 py-2.5">
              {confirmingClear ? (
                <>
                  <span className="text-sm text-ink-muted">Clear this conversation?</span>
                  <button
                    type="button"
                    onClick={async () => {
                      await clearChat()
                      setConfirmingClear(false)
                    }}
                    className="rounded-full bg-danger px-3 py-1 text-sm font-medium text-white transition hover:bg-danger/90"
                  >
                    Yes, clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingClear(false)}
                    className="rounded-full px-3 py-1 text-sm font-medium text-ink-muted transition hover:bg-teal-tint"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <RequireAuthButton
                  action={() => setConfirmingClear(true)}
                  variant="ghost"
                  className="!px-3 !py-1 text-sm"
                >
                  <RotateCcw size={14} />
                  New chat
                </RequireAuthButton>
              )}
            </div>
          )}
          <div className="flex-1 space-y-3 overflow-y-auto p-6">
            {!loading && messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <p className="text-sm text-ink-muted">
                  Ask about your spending, goals, or whether you can afford something - answers are
                  grounded in your real numbers.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => guard(() => submit(prompt))}
                      className="rounded-full border border-teal/30 bg-teal-tint px-3.5 py-2 text-sm font-medium text-teal-dark transition hover:bg-teal/20"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === 'user' ? 'bg-teal-tint text-ink' : 'border border-border bg-surface text-ink'
                  }`}
                >
                  {m.role === 'assistant' ? <GroundedText text={m.content} /> : m.content}
                </p>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <TypingIndicator />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {error && (
            <p className="mx-4 mb-2 rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              guard(() => submit(draft))
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

        <HistoryPanel transactions={transactions} />
      </div>
    </div>
  )
}
