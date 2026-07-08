import './PiggyBankAnimation.css'

const CREAM = '#FBF7F0'
const MARIGOLD = '#E8A24C'
const TEAL_DARK = '#1E5F5C'
const INK = '#26302E'

// Coins land here - keep every coin's resting position matched to the slot
// center so the fall reads as "into the slot," not "floating nearby."
const SLOT_X = 106
const SLOT_Y = 130

function Coin({ n, cx }: { n: number; cx: number }) {
  return (
    <g className="piggy-coin" data-coin={n}>
      <circle cx={cx} cy={SLOT_Y} r={9} fill={MARIGOLD} stroke={CREAM} strokeWidth={1.5} />
      <circle cx={cx} cy={SLOT_Y} r={5} fill="none" stroke={CREAM} strokeWidth={1} opacity={0.6} />
    </g>
  )
}

export function PiggyBankAnimation() {
  return (
    <svg viewBox="0 0 240 260" className="h-full w-full" role="img" aria-label="Animated piggy bank collecting coins">
      <g className="piggy-grow">
        <g className="piggy-bounce">
          {/* tail */}
          <path
            d="M48,168 Q34,158 42,144 Q50,154 58,150"
            fill="none"
            stroke={CREAM}
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* legs */}
          <rect x={78} y={210} width={15} height={28} rx={7} fill={TEAL_DARK} stroke={CREAM} strokeWidth={2.5} />
          <rect x={148} y={210} width={15} height={28} rx={7} fill={TEAL_DARK} stroke={CREAM} strokeWidth={2.5} />
          {/* ear */}
          <path d="M132,140 Q142,108 160,132 Q148,146 132,140 Z" fill={CREAM} stroke={CREAM} strokeLinejoin="round" />
          {/* body */}
          <ellipse cx={114} cy={176} rx={68} ry={46} fill={TEAL_DARK} stroke={CREAM} strokeWidth={3.5} />
          {/* snout */}
          <ellipse cx={176} cy={174} rx={17} ry={13} fill={CREAM} stroke={CREAM} strokeWidth={3} />
          <circle cx={180} cy={170} r={1.8} fill={INK} />
          <circle cx={180} cy={178} r={1.8} fill={INK} />
          {/* eye */}
          <circle cx={151} cy={162} r={4.5} fill={MARIGOLD} />
          <circle cx={152} cy={161} r={1.6} fill={INK} />
          {/* coin slot */}
          <rect
            x={SLOT_X - 16}
            y={SLOT_Y - 4}
            width={32}
            height={8}
            rx={4}
            fill="none"
            stroke={MARIGOLD}
            strokeWidth={3}
            transform={`rotate(-6 ${SLOT_X} ${SLOT_Y})`}
          />

          <Coin n={1} cx={SLOT_X - 7} />
          <Coin n={2} cx={SLOT_X} />
          <Coin n={3} cx={SLOT_X + 7} />
        </g>
      </g>
    </svg>
  )
}
