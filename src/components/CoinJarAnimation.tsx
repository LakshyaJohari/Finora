import './CoinJarAnimation.css'

const CREAM = '#FBF7F0'
const MARIGOLD = '#E8A24C'
const MARIGOLD_EDGE = '#C17F35'
const TEAL_DARK = '#1E5F5C'

// Coins fall through the gap in the lid and land on top of the pile -
// keep every falling coin's resting x within that gap so the motion
// reads as "into the jar," not "floating nearby."
const SLOT_CENTER_X = 120
const LANDING_Y = 168

function CoinGraphic({ cx, cy, r = 11 }: { cx: number; cy: number; r?: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="url(#coinShine)" stroke={MARIGOLD_EDGE} strokeWidth={1} />
      <circle cx={cx} cy={cy} r={r * 0.6} fill="none" stroke={CREAM} strokeWidth={1} opacity={0.5} />
      <ellipse
        cx={cx - r * 0.32}
        cy={cy - r * 0.35}
        rx={r * 0.3}
        ry={r * 0.16}
        fill={CREAM}
        opacity={0.55}
        transform={`rotate(-30 ${cx - r * 0.32} ${cy - r * 0.35})`}
      />
    </>
  )
}

function Coin({ n, cx, cy }: { n: number; cx: number; cy: number }) {
  return (
    <g className="jar-coin" data-coin={n}>
      <CoinGraphic cx={cx} cy={cy} />
    </g>
  )
}

export function CoinJarAnimation() {
  return (
    <svg viewBox="0 0 240 260" className="h-full w-full" role="img" aria-label="Animated jar filling up with coins">
      <defs>
        <radialGradient id="coinShine" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#F6CD91" />
          <stop offset="55%" stopColor={MARIGOLD} />
          <stop offset="100%" stopColor={MARIGOLD_EDGE} />
        </radialGradient>
      </defs>

      <g className="jar-grow">
        {/* ground shadow */}
        <ellipse cx={120} cy={228} rx={58} ry={8} fill="#000000" opacity={0.12} />

        <g className="jar-bounce">
          {/* lid, split to leave a coin slot in the middle */}
          <rect x={82} y={58} width={30} height={16} rx={6} fill={MARIGOLD} />
          <rect x={128} y={58} width={30} height={16} rx={6} fill={MARIGOLD} />

          {/* neck connecting lid to jar body */}
          <path d="M90,72 L88,96 L152,96 L150,72 Z" fill="none" stroke={CREAM} strokeWidth={4} strokeLinejoin="round" />

          {/* jar body */}
          <rect x={68} y={92} width={104} height={132} rx={22} fill={TEAL_DARK} fillOpacity={0.35} stroke={CREAM} strokeWidth={4} />

          {/* pile of coins already saved */}
          <CoinGraphic cx={98} cy={202} />
          <CoinGraphic cx={122} cy={208} />
          <CoinGraphic cx={146} cy={200} />
          <CoinGraphic cx={110} cy={186} />
          <CoinGraphic cx={134} cy={184} />

          <Coin n={1} cx={SLOT_CENTER_X - 8} cy={LANDING_Y} />
          <Coin n={2} cx={SLOT_CENTER_X} cy={LANDING_Y - 6} />
          <Coin n={3} cx={SLOT_CENTER_X + 8} cy={LANDING_Y} />
        </g>
      </g>
    </svg>
  )
}
