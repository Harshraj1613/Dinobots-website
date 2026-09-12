import { useEffect, useRef, useState } from 'react'
import { motion, type Variants } from 'framer-motion'

type Stage = 'initial' | 'ringAppear' | 'dReveal' | 'pulse' | 'open' | 'settled'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

// Timeline (ms) — unchanged from the previous pass; only the visual
// asset changes here, not the choreography.
const T_RING_APPEAR = 500
const T_D_REVEAL = 950
const T_PULSE = 1600
const T_OPEN = 2000
const T_SETTLED = 3600

const MARK_SIZE = 'clamp(84px, 18vw, 120px)'
const WORD_FONT = 'clamp(20px, 5vw, 38px)'
const GROUP_GAP = 'clamp(12px, 2.6vw, 20px)'
const WORD_FONT_FAMILY = "'Chakra Petch', sans-serif"
const DROP_SHADOW = '0 8px 14px rgba(0,0,0,0.5)'

const WORD = ['D', 'I', 'N', 'O', 'B', 'O', 'T', 'S']

// ---------------------------------------------------------------------------
// Geometry — the gear ring and the D emblem are both generated as SVG path
// data at module scope (computed once, never per-render).
// ---------------------------------------------------------------------------

const polar = (cx: number, cy: number, r: number, angleRad: number) => ({
  x: +(cx + r * Math.cos(angleRad)).toFixed(2),
  y: +(cy + r * Math.sin(angleRad)).toFixed(2),
})

function buildGearPath(cx: number, cy: number, teeth: number, outerR: number, rootR: number, holeR: number) {
  const step = (Math.PI * 2) / teeth
  const tipHalf = step * 0.16
  const rootHalf = step * 0.3
  let d = ''
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    const p1 = polar(cx, cy, rootR, a - rootHalf)
    const p2 = polar(cx, cy, outerR, a - tipHalf)
    const p3 = polar(cx, cy, outerR, a + tipHalf)
    const p4 = polar(cx, cy, rootR, a + rootHalf)
    d += i === 0 ? `M ${p1.x} ${p1.y} ` : `L ${p1.x} ${p1.y} `
    d += `L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} `
  }
  d += 'Z '
  d += `M ${cx + holeR} ${cy} A ${holeR} ${holeR} 0 1 0 ${cx - holeR} ${cy} A ${holeR} ${holeR} 0 1 0 ${cx + holeR} ${cy} Z`
  return d
}

function buildDPath(flatX: number, archCenterX: number, midY: number, archR: number, segments = 16) {
  const topY = midY - archR
  const bottomY = midY + archR
  let d = `M ${flatX} ${topY} L ${flatX} ${bottomY} `
  for (let i = 0; i <= segments; i++) {
    const angleDeg = 90 - (180 * i) / segments
    const p = polar(archCenterX, midY, archR, (angleDeg * Math.PI) / 180)
    d += `L ${p.x} ${p.y} `
  }
  d += 'Z'
  return d
}

const CX = 64
const CY = 64
const OUTER_R = 60
const ROOT_R = 46
const HOLE_R = 34

const GEAR_PATH = buildGearPath(CX, CY, 14, OUTER_R, ROOT_R, HOLE_R)
const D_PATH = buildDPath(44, 62, 64, 22)

// Dark-blue → light-blue ramp for the wordmark. Interpolated per letter
// (not a single CSS background-clip gradient) so it renders correctly
// even though each letter is its own independently-animated element.
const DARK_BLUE: [number, number, number] = [27, 58, 99]
const LIGHT_BLUE: [number, number, number] = [142, 203, 255]
const lerpColor = (a: [number, number, number], b: [number, number, number], t: number) =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)}, ${Math.round(a[1] + (b[1] - a[1]) * t)}, ${Math.round(a[2] + (b[2] - a[2]) * t)})`

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const gearGroupVariants: Variants = {
  initial: { opacity: 0, scale: 0.86, rotateX: 14, filter: `blur(6px) drop-shadow(${DROP_SHADOW})` },
  ringAppear: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    filter: `blur(0px) drop-shadow(${DROP_SHADOW})`,
    transition: { duration: 0.8, ease: EASE_OUT },
  },
  dReveal: { opacity: 1, scale: 1, rotateX: 0, filter: `blur(0px) drop-shadow(${DROP_SHADOW})` },
  pulse: {
    opacity: 1,
    scale: [1, 1.02, 1],
    rotateX: 0,
    filter: `blur(0px) drop-shadow(${DROP_SHADOW})`,
    transition: { duration: 0.45, ease: 'easeInOut' },
  },
  open: { opacity: 1, scale: 1, rotateX: 0, filter: `blur(0px) drop-shadow(${DROP_SHADOW})` },
  settled: { opacity: 1, scale: 1, rotateX: 0, filter: `blur(0px) drop-shadow(${DROP_SHADOW})` },
}

const dGroupVariants: Variants = {
  initial: { opacity: 0, scale: 0.88, filter: 'blur(6px)' },
  ringAppear: { opacity: 0, scale: 0.88, filter: 'blur(6px)' },
  dReveal: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE_OUT } },
  pulse: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  open: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  settled: { opacity: 1, scale: 1, filter: 'blur(0px)' },
}

const hiddenWordLetter = { opacity: 0, x: 10, filter: 'blur(6px)' }

const wordLetterVariants: Variants = {
  initial: hiddenWordLetter,
  ringAppear: hiddenWordLetter,
  dReveal: hiddenWordLetter,
  pulse: hiddenWordLetter,
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: EASE_OUT, delay: i * 0.13 },
  }),
  settled: () => ({ opacity: 1, x: 0, filter: 'blur(0px)' }),
}

interface PreloaderProps {
  /** Fired once, when the preloader's own animation reaches its final settled state. */
  onComplete?: () => void
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [stage, setStage] = useState<Stage>('initial')
  const timers = useRef<number[]>([])
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    // Owns this lock unconditionally for exactly its own mounted lifetime —
    // deliberately does NOT capture/restore a "previous" overflow value.
    // App's own scene-lock effect below also touches body.style.overflow,
    // and effects on a child (this one) fire before effects on its parent
    // (App), so a capture here would grab App's not-yet-applied state and
    // a later restore would resurrect that stale snapshot instead of the
    // true unlocked baseline — that mismatch is exactly what used to leave
    // /join-us permanently scroll-locked after navigating from Home.
    document.body.style.overflow = 'hidden'

    const schedule = (delay: number, next: Stage) => {
      timers.current.push(window.setTimeout(() => setStage(next), delay))
    }

    schedule(T_RING_APPEAR, 'ringAppear')
    schedule(T_D_REVEAL, 'dReveal')
    schedule(T_PULSE, 'pulse')
    schedule(T_OPEN, 'open')
    timers.current.push(
      window.setTimeout(() => {
        setStage('settled')
        onCompleteRef.current?.()
      }, T_SETTLED),
    )

    return () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current = []
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black px-6"
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(6px)', transition: { duration: 0.9, ease: EASE_OUT } }}
    >
      <div className="flex items-center" style={{ gap: GROUP_GAP }}>
        <div className="relative shrink-0" style={{ width: MARK_SIZE, height: MARK_SIZE }}>
          <svg viewBox="0 0 128 128" className="absolute inset-0 h-full w-full" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="gearGrad" x1="20%" y1="10%" x2="85%" y2="95%">
                <stop offset="0%" stopColor="#fbfbf9" />
                <stop offset="45%" stopColor="#d9dadc" />
                <stop offset="100%" stopColor="#9a9da3" />
              </linearGradient>
            </defs>

            <motion.g
              variants={gearGroupVariants}
              initial="initial"
              animate={stage}
              style={{ transformOrigin: '64px 64px', transformPerspective: 500 }}
            >
              <path d={GEAR_PATH} fillRule="evenodd" fill="#4b4e54" transform="translate(2,4)" />
              <path d={GEAR_PATH} fillRule="evenodd" fill="url(#gearGrad)" />
              <circle cx={CX} cy={CY} r={HOLE_R + 1} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
            </motion.g>

            <motion.g
              variants={dGroupVariants}
              initial="initial"
              animate={stage}
              style={{ transformOrigin: '64px 64px' }}
            >
              <path d={D_PATH} fill="#4b4e54" transform="translate(2,3)" />
              <path d={D_PATH} fill="url(#gearGrad)" />
              <rect x={48} y={50} width={10} height={5} fill="#000" />
              <rect x={48} y={79} width={10} height={5} fill="#000" />
            </motion.g>
          </svg>
        </div>

        <div className="flex" style={{ fontFamily: WORD_FONT_FAMILY, fontWeight: 700, letterSpacing: '0.08em' }}>
          {WORD.map((letter, i) => (
            <motion.span
              key={i}
              className="inline-block select-none"
              style={{
                fontSize: WORD_FONT,
                lineHeight: 1,
                color: lerpColor(DARK_BLUE, LIGHT_BLUE, i / (WORD.length - 1)),
              }}
              custom={i}
              variants={wordLetterVariants}
              initial="initial"
              animate={stage}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
