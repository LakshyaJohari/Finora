import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const START_ANGLE = -135
const END_ANGLE = 135

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
}

export function HealthScoreGauge({ score, size = 220 }: { score: number; size?: number }) {
  const { theme } = useTheme()
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  const [offset, setOffset] = useState(100)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setOffset(100 - clamped)
      return
    }
    const raf = requestAnimationFrame(() => setOffset(100 - clamped))
    return () => cancelAnimationFrame(raf)
  }, [clamped])

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 18
  const trackColor = theme === 'dark' ? '#33413D' : '#E8E2D6'
  const path = describeArc(cx, cy, r, START_ANGLE, END_ANGLE)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Financial health score: ${clamped} out of 100`}>
        <path d={path} fill="none" stroke={trackColor} strokeWidth={14} strokeLinecap="round" />
        <path
          d={path}
          fill="none"
          stroke="#2A7F7B"
          strokeWidth={14}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl text-ink">{clamped}</span>
        <span className="text-xs text-ink-muted">out of 100</span>
      </div>
    </div>
  )
}
