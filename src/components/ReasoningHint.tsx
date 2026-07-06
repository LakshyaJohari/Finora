import { Sparkles } from 'lucide-react'

export function ReasoningHint({ reasoning }: { reasoning: string | null }) {
  if (!reasoning) return null
  return (
    <details className="relative inline-block">
      <summary
        aria-label="Why this category?"
        className="flex h-5 w-5 cursor-pointer list-none items-center justify-center rounded-full text-marigold transition hover:bg-marigold-tint"
      >
        <Sparkles size={12} />
      </summary>
      <div className="card absolute right-0 z-20 mt-2 w-56 p-3 text-left text-xs font-normal text-ink shadow-softer">
        {reasoning}
      </div>
    </details>
  )
}
