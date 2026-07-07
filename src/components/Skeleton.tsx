export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card flex flex-col gap-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded bg-teal-tint"
          style={{ width: i === 0 ? '50%' : `${85 - i * 10}%` }}
        />
      ))}
    </div>
  )
}

export function ErrorNotice({ message }: { message: string }) {
  return <p className="rounded-card border border-danger/20 bg-danger-tint px-4 py-3 text-sm text-danger">{message}</p>
}
