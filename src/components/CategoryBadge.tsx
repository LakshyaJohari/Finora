const CATEGORY_STYLES: Record<string, string> = {
  Food: 'bg-marigold-tint text-marigold',
  Transport: 'bg-teal-tint text-teal-dark',
  Shopping: 'bg-marigold-tint text-marigold',
  Bills: 'bg-teal-tint text-teal-dark',
  Entertainment: 'bg-marigold-tint text-marigold',
  Health: 'bg-teal-tint text-teal-dark',
  Other: 'bg-base text-ink-muted border border-border',
  Uncategorized: 'bg-base text-ink-muted border border-border',
}

export function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_STYLES[category] ?? 'bg-base text-ink-muted border border-border'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {category}
    </span>
  )
}
