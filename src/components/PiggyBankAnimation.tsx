import './PiggyBankAnimation.css'

const CREAM = '#FBF7F0'
const MARIGOLD = '#E8A24C'
const TEAL_DARK = '#1E5F5C'
const INK = '#26302E'

function Coin({ n, cx, cy }: { n: number; cx: number; cy: number }) {
  return (
    <g className="piggy-coin" data-coin={n}>
      <circle cx={cx} cy={cy} r={9} fill={MARIGOLD} stroke={CREAM} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={5.5} fill="none" stroke={CREAM} strokeWidth={1} opacity={0.6} />
    </g>
  )
}

export function PiggyBankAnimation() {
  return (
    <svg viewBox="0 0 240 220" className="h-full w-full" role="img" aria-label="Animated piggy bank collecting coins">
      <g className="piggy-grow">
        <g className="piggy-bounce">
          {/* tail */}
          <path
            d="M50,120 Q36,110 44,96 Q52,106 60,102"
            fill="none"
            stroke={CREAM}
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* legs */}
          <rect x={74} y={166} width={15} height={28} rx={7} fill={TEAL_DARK} stroke={CREAM} strokeWidth={2.5} />
          <rect x={150} y={166} width={15} height={28} rx={7} fill={TEAL_DARK} stroke={CREAM} strokeWidth={2.5} />
          {/* ear */}
          <path
            d="M134,96 Q146,66 162,90 Q150,102 134,96 Z"
            fill={CREAM}
            stroke={CREAM}
            strokeLinejoin="round"
          />
          {/* body */}
          <ellipse cx={110} cy={132} rx={64} ry={44} fill={TEAL_DARK} stroke={CREAM} strokeWidth={3.5} />
          {/* snout */}
          <ellipse cx={168} cy={130} rx={17} ry={13} fill={CREAM} stroke={CREAM} strokeWidth={3} />
          <circle cx={172} cy={126} r={1.8} fill={INK} />
          <circle cx={172} cy={134} r={1.8} fill={INK} />
          {/* eye */}
          <circle cx={148} cy={116} r={4.5} fill={MARIGOLD} />
          <circle cx={149} cy={115} r={1.6} fill={INK} />
          {/* coin slot */}
          <rect
            x={88}
            y={84}
            width={30}
            height={7}
            rx={3.5}
            fill="none"
            stroke={MARIGOLD}
            strokeWidth={3}
            transform="rotate(-8 103 87.5)"
          />

          <Coin n={1} cx={96} cy={88} />
          <Coin n={2} cx={103} cy={86} />
          <Coin n={3} cx={111} cy={89} />
        </g>
      </g>
    </svg>
  )
}
