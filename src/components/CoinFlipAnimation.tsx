import { PiggyBank } from 'lucide-react'
import './CoinFlipAnimation.css'

const TEAL_DARK = '#1E5F5C'

export function CoinFlipAnimation() {
  return (
    <div className="coin-flip-scene flex h-full w-full items-center justify-center">
      <div className="coin-flip">
        <div className="coin-face coin-face--front">
          <div className="coin-face__ring" />
          <PiggyBank size={56} color={TEAL_DARK} strokeWidth={1.75} />
        </div>
        <div className="coin-face coin-face--back">
          <div className="coin-face__ring" />
        </div>
      </div>
    </div>
  )
}
