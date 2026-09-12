import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { useRef, useState } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform, type Variants } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { heroContent } from '../content/hero'
import HeroFollowButton from './HeroFollowButton'
import { useSiteSettings } from '../hooks/useSiteSettings'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const HEADING_FONT = "'Unbounded', sans-serif"
const BODY_FONT = "'Inter', sans-serif"
const DESCRIPTION_FONT = "'IBM Plex Sans', sans-serif"

// Hero description: soft white for most of the block, cooling into a muted
// steel/deep-blue only at the very bottom — black+blue+white, no red.
const DESCRIPTION_GRADIENT = 'linear-gradient(180deg, #EAF1F4 0%, #EAF1F4 55%, #cfe0ea 78%, #294E6B 100%)'
const DESCRIPTION_TEXT_SHADOW = '0 1px 3px rgba(7,10,13,0.55)'

// DINOBOTS signature color system — black + red.
const BG = '#050505' // primary background
const DEEP_BLACK = '#0A0A0A' // secondary surfaces
const DARK_RED = '#3A0808'
const CRIMSON = '#7A0B12'
const RED = '#B5121B' // primary accent red
const BRIGHT_RED = '#E3222E' // tiny highlights only
const SILVER = '#D7D7D7' // metallic highlight, used sparingly
// Headline material — black through dark red and crimson into red, with a
// silver highlight only at the very trailing edge.
const HEADLINE_GRADIENT = `linear-gradient(100deg, ${DEEP_BLACK} 0%, ${DEEP_BLACK} 22%, ${DARK_RED} 40%, ${CRIMSON} 58%, ${RED} 78%, ${SILVER} 100%)`

interface HeroProps {
  /** Set once the preloader has finished and handed off. Gates every entrance animation below. */
  revealed: boolean
  /** EXPLORE DINOBOTS — starts the automatic cinematic walk through every
   *  homepage section. Owned by App (it drives the same cinematic scene
   *  machine the navbar and scroll do), Hero just triggers it. */
  onExplore: () => void
  /** OUR PROJECTS — jumps directly to the Projects section (no slideshow). */
  onGoToProjects: () => void
}

// A rise-from-darkness reveal used for most elements: opacity + a small
// upward drift + a blur-to-sharp focus pull, matching the preloader's motion
// language. `delay` is in seconds from the moment the Hero is revealed.
const reveal = (delay: number, duration = 0.85, distance = 30): Variants => ({
  hidden: { opacity: 0, y: distance, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration, delay, ease: EASE_OUT } },
})

// Same reveal, but the gear also "powers on" — starting dim/desaturated and
// brightening to full strength as it settles into place.
const gearReveal = (delay: number, duration = 1, distance = 40): Variants => ({
  hidden: { opacity: 0, y: distance, filter: 'blur(10px) brightness(0.55) saturate(0.6)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px) brightness(1) saturate(1)',
    transition: { duration, delay, ease: EASE_OUT },
  },
})

const fadeIn = (delay: number, duration = 1): Variants => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration, delay, ease: EASE_OUT } },
})

// ---------------------------------------------------------------------------
// Gear geometry — a filled, layered mechanical gear (teeth ring + hole),
// plus a custom "D" emblem, computed once at module scope.
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

function buildDPath(cx: number, cy: number, flatOffset: number, archOffset: number, archR: number, segments = 16) {
  const flatX = cx - flatOffset
  const archCenterX = cx + archOffset
  const topY = cy - archR
  const bottomY = cy + archR
  let d = `M ${flatX} ${topY} L ${flatX} ${bottomY} `
  for (let i = 0; i <= segments; i++) {
    const angleDeg = 90 - (180 * i) / segments
    const p = polar(archCenterX, cy, archR, (angleDeg * Math.PI) / 180)
    d += `L ${p.x} ${p.y} `
  }
  d += 'Z'
  return d
}

const CX = 200
const CY = 200
const TEETH = 16
const OUTER_R = 150
const ROOT_R = 122
const HOLE_R = 90
const INNER_RING_R = 66

const GEAR_PATH = buildGearPath(CX, CY, TEETH, OUTER_R, ROOT_R, HOLE_R)
const D_PATH = buildDPath(CX, CY, 24, 6, 30)

// A handful of teeth (evenly spaced) carry a small integrated energy
// indicator — not the whole gear turned into a light show.
const ENERGY_TOOTH_INDICES = [0, 4, 8, 12]
const ENERGY_DOTS = ENERGY_TOOTH_INDICES.map((i) => {
  const angle = i * ((Math.PI * 2) / TEETH)
  return polar(CX, CY, (OUTER_R + ROOT_R) / 2, angle)
})
// A few different embedded red indicator LEDs — dark red, crimson, red,
// bright red — not a single flat hue, but all within the red family.
const ENERGY_DOT_COLORS = [RED, CRIMSON, RED, BRIGHT_RED]

// Four short technical connector marks, one per annotation corner.
const CONNECTORS = [
  { dot: { x: 36, y: 36 }, tip: { x: 72, y: 66 } },
  { dot: { x: 364, y: 36 }, tip: { x: 328, y: 66 } },
  { dot: { x: 36, y: 364 }, tip: { x: 72, y: 334 } },
  { dot: { x: 364, y: 364 }, tip: { x: 328, y: 334 } },
]
const CONNECTOR_COLORS = [RED, RED, RED, BRIGHT_RED]

const PARALLAX_RANGE = 10
const TILT_RANGE = 4

function useGearInteraction() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const spring = { stiffness: 55, damping: 16, mass: 0.6 }
  const springX = useSpring(x, spring)
  const springY = useSpring(y, spring)
  const springRotateX = useSpring(rotateX, spring)
  const springRotateY = useSpring(rotateY, spring)

  const onMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    x.set(px * PARALLAX_RANGE * 2)
    y.set(py * PARALLAX_RANGE * 2)
    rotateY.set(px * TILT_RANGE * 2)
    rotateX.set(py * -TILT_RANGE * 2)
  }

  const onMouseLeave = () => {
    x.set(0)
    y.set(0)
    rotateX.set(0)
    rotateY.set(0)
  }

  return { springX, springY, springRotateX, springRotateY, onMouseMove, onMouseLeave }
}

export default function Hero({ revealed, onExplore, onGoToProjects }: HeroProps) {
  const animate = revealed ? 'visible' : 'hidden'
  const { springX, springY, springRotateX, springRotateY, onMouseMove, onMouseLeave } = useGearInteraction()
  const [hovering, setHovering] = useState(false)
  const settings = useSiteSettings()
  const headingLines = [settings.homeHeroLine1, settings.homeHeroLine2, settings.homeHeroLine3]

  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const headingY = useTransform(scrollYProgress, [0, 1], [0, -40])
  const gearScrollScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const labelsOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] w-full"
      style={
        {
          backgroundColor: BG,
          overflow: 'clip',
          contain: 'paint',
          // Continuous, pure-CSS responsive variables — every downstream
          // blur/opacity/scale/position value below reads from these, so
          // nothing here depends on a resize listener or React state, and
          // nothing snaps at a breakpoint: they're smooth functions of vw.
          '--gear-width': 'clamp(260px, 46vw, 420px)',
          '--gear-blur': 'clamp(0px, calc(((1024px - 100vw) / 664px) * 7px), 7px)',
          '--gear-opacity': 'clamp(0.18, calc(1 - ((1024px - 100vw) / 664px) * 0.82), 1)',
          '--gear-drift': 'clamp(-70px, calc(((1440px - 100vw) / 416px) * -70px), 0px)',
          // 1.5px floor = the subtle always-on desktop softening; the same
          // ramp then carries it up to 8px by mobile widths, unchanged.
          '--bg-blur': 'clamp(1.5px, calc(((1024px - 100vw) / 664px) * 8px), 8px)',
          '--bg-scale': 'clamp(1.01, calc(1 + ((1024px - 100vw) / 664px) * 0.06), 1.06)',
          '--overlay-extra': 'clamp(0, calc(((1024px - 100vw) / 664px) * 0.25), 0.25)',
        } as CSSProperties
      }
    >
      {/* Background photo — full-bleed, behind everything else. The responsive
          blur + scale-compensation live on this outer, non-animated wrapper so
          they never fight the existing Framer Motion breathing-zoom below. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          filter: 'blur(var(--bg-blur))',
          transform: 'scale(var(--bg-scale))',
          overflow: 'clip',
          contain: 'paint',
        }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/dinobots-home-bg.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
          initial={{ opacity: 0, scale: 1 }}
          animate={revealed ? { opacity: 1, scale: [1, 1.02, 1] } : { opacity: 0, scale: 1 }}
          transition={
            revealed
              ? { opacity: { duration: 1.2, ease: EASE_OUT }, scale: { duration: 24, repeat: Infinity, ease: 'easeInOut' } }
              : { duration: 0.4 }
          }
        />
      </div>

      {/* Extra responsive darkening — grows only as the viewport narrows,
          layered on top of the two static overlays below (both unchanged). */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: 'rgb(5 5 5 / var(--overlay-extra))' }}
      />

      {/* Dark cinematic overlay: top/bottom gradient + vignette, neutral black
          (no blue tint) so the red atmosphere below reads clean. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[#050505]/60 sm:bg-[#050505]/50"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(5,5,5,0.58) 0%, rgba(5,5,5,0.42) 45%, rgba(5,5,5,0.64) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(ellipse at center, rgba(5,5,5,0) 35%, rgba(5,5,5,0.58) 100%)',
        }}
      />

      {/* Atmospheric accent: faint dark-red/crimson light field only — no grid pattern. */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        variants={fadeIn(0, 1.2)}
        initial="hidden"
        animate={animate}
      >
        <svg className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <defs>
            <radialGradient id="heroGlow" cx="76%" cy="32%" r="60%">
              <stop offset="0%" stopColor="rgba(181,18,27,0.12)" />
              <stop offset="55%" stopColor="rgba(58,8,8,0.08)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroGlow)" />
        </svg>
      </motion.div>

      {/* Main composition */}
      <div className="relative z-10 mx-auto grid min-h-[100dvh] w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 pt-28 pb-24 lg:grid-cols-2 lg:gap-12 lg:px-12 lg:pt-24">
        {/* Left: heading, description, CTAs */}
        <div className="flex flex-col items-start">
          <div className="relative">
            {/* soft dark scrim behind the heading only — keeps the dark end of
                the metallic gradient legible against the busy background photo,
                without touching the background itself. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-6 -inset-y-8"
              style={{
                backgroundImage: 'radial-gradient(ellipse 80% 75% at 28% 45%, rgba(4,3,3,0.55) 0%, rgba(4,3,3,0) 72%)',
                filter: 'blur(18px)',
              }}
            />

            <motion.h1
              className="relative text-[clamp(2.75rem,5.5vw,5.75rem)] font-bold uppercase leading-[0.96] tracking-tight"
              style={{ fontFamily: HEADING_FONT, y: headingY }}
            >
              {headingLines.map((line, i) => {
                const delay = 0.55 + i * 0.13
                return (
                  <motion.span
                    key={line}
                    className="relative block"
                    variants={reveal(delay, 0.9, 36)}
                    initial="hidden"
                    animate={animate}
                  >
                    {/* base metallic gradient — the readable, static final state */}
                    <span
                      style={{
                        backgroundImage: HEADLINE_GRADIENT,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        WebkitTextFillColor: 'transparent',
                        WebkitTextStroke: '0.7px rgba(215,195,195,0.25)',
                        textShadow: '0 1px 0 rgba(220,200,200,0.15), 0 4px 14px rgba(0,0,0,0.6)',
                      }}
                    >
                      {line}
                    </span>
                    {/* one-time highlight sweep, layered exactly on top */}
                    <span
                      aria-hidden="true"
                      className="hero-shimmer pointer-events-none absolute inset-0"
                      style={{
                        backgroundImage:
                          'linear-gradient(100deg, transparent 30%, rgba(220,215,215,0.5) 48%, rgba(220,215,215,0.5) 52%, transparent 70%)',
                        backgroundSize: '300% 100%',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        WebkitTextFillColor: 'transparent',
                        animationDelay: `${delay}s`,
                      }}
                    >
                      {line}
                    </span>
                  </motion.span>
                )
              })}
            </motion.h1>
          </div>

          <motion.p
            className="mt-8 max-w-[500px] text-base font-normal leading-relaxed sm:text-lg"
            style={{
              fontFamily: DESCRIPTION_FONT,
              backgroundImage: DESCRIPTION_GRADIENT,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              textShadow: DESCRIPTION_TEXT_SHADOW,
            }}
            variants={reveal(1.05, 0.8, 20)}
            initial="hidden"
            animate={animate}
          >
            {settings.homeHeroDescription}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-4"
            variants={reveal(1.25, 0.8, 20)}
            initial="hidden"
            animate={animate}
            style={{ fontFamily: BODY_FONT }}
          >
            <button
              type="button"
              onClick={onExplore}
              className="rounded-full border border-[#b5121b] bg-[#0a0a0a] px-7 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[#eaf4f7] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2a0a0c] hover:border-[#e3222e]"
            >
              {settings.homeExploreCtaText}
            </button>
            <button
              type="button"
              onClick={onGoToProjects}
              className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e3222e88] hover:bg-[#e3222e0d] hover:text-[#f7dcdc]"
            >
              {settings.homeProjectsCtaText}
            </button>
          </motion.div>

          <motion.div
            className="mt-5 flex flex-wrap items-center gap-4"
            variants={reveal(1.4, 0.7, 16)}
            initial="hidden"
            animate={animate}
            style={{ fontFamily: BODY_FONT }}
          >
            <HeroFollowButton label={settings.homeFollowCtaText} />
          </motion.div>
        </div>

        {/* Right on desktop: 3D mechanical gear visual. Below `lg` it becomes
            a large background element behind the text. Width, opacity and
            blur are driven continuously by the --gear-* variables defined on
            the section (pure CSS, no resize listener, no breakpoint snap) —
            only the position MODE (grid column vs. absolute/centered) and
            z-index switch discretely at `lg`, at which point width/opacity/
            blur are already close to their desktop values, minimizing the
            jump. The gear's own entrance animation, scroll-scale and mouse
            interaction (on the inner motion.div) are completely unchanged. */}
        <div
          className="pointer-events-none absolute left-1/2 top-[45%] -z-10 max-w-none -translate-x-1/2 -translate-y-1/2 lg:pointer-events-auto lg:relative lg:left-auto lg:top-auto lg:z-auto lg:mx-0 lg:ml-auto lg:translate-x-[var(--gear-drift)] lg:translate-y-0"
          style={{ width: 'var(--gear-width)', opacity: 'var(--gear-opacity)', filter: 'blur(var(--gear-blur))' }}
        >
          <motion.div
            className="relative w-full"
            variants={gearReveal(0.25, 1, 40)}
            initial="hidden"
            animate={animate}
            style={{ scale: gearScrollScale }}
            onMouseMove={onMouseMove}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => {
              setHovering(false)
              onMouseLeave()
            }}
          >
            <div className="relative aspect-square w-full">
              <motion.div
                className="absolute inset-0"
                style={{
                  x: springX,
                  y: springY,
                  rotateX: springRotateX,
                  rotateY: springRotateY,
                  transformPerspective: 700,
                }}
              >
                <svg viewBox="0 0 400 400" className="h-full w-full" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="gearFace" x1="15%" y1="10%" x2="90%" y2="95%">
                      <stop offset="0%" stopColor={SILVER} />
                      <stop offset="40%" stopColor="#a8a8a8" />
                      <stop offset="75%" stopColor="#4a4a4a" />
                      <stop offset="100%" stopColor="#1a1a1a" />
                    </linearGradient>
                  </defs>
  
                  {/* static outer/inner reference rings */}
                  <circle
                    cx={CX}
                    cy={CY}
                    r={178}
                    fill="none"
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth={1}
                    strokeDasharray="2 8"
                  />
  
                  {/* rotating gear body — teeth, extrusion, energy indicators */}
                  <motion.g
                    style={{ transformOrigin: `${CX}px ${CY}px` }}
                    animate={{ rotate: 360, scale: hovering ? 1.015 : 1, filter: hovering ? 'brightness(1.15)' : 'brightness(1)' }}
                    transition={{
                      rotate: { duration: 26, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 0.4, ease: 'easeOut' },
                      filter: { duration: 0.4, ease: 'easeOut' },
                    }}
                  >
                    <path d={GEAR_PATH} fillRule="evenodd" fill={DEEP_BLACK} transform="translate(3,5)" />
                    <path d={GEAR_PATH} fillRule="evenodd" fill="url(#gearFace)" />
                    {ENERGY_DOTS.map((p, i) => (
                      <motion.circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={2.5}
                        fill={ENERGY_DOT_COLORS[i]}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                      />
                    ))}
                  </motion.g>
  
                  {/* static mechanical ring boundary + hole shadow */}
                  <circle cx={CX} cy={CY} r={ROOT_R - 6} fill="none" stroke={`${DARK_RED}cc`} strokeWidth={2} />
                  <circle cx={CX} cy={CY} r={HOLE_R + 1} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
  
                  {/* inner technical ring — slow counter-rotation, subtle red reflection */}
                  <motion.g
                    style={{ transformOrigin: `${CX}px ${CY}px` }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
                  >
                    <circle
                      cx={CX}
                      cy={CY}
                      r={INNER_RING_R}
                      fill="none"
                      stroke={`${CRIMSON}66`}
                      strokeWidth={1}
                      strokeDasharray="4 6"
                    />
                  </motion.g>
  
                  {/* D emblem — fixed, engineered mark at the center */}
                  <path d={D_PATH} fill={DEEP_BLACK} transform="translate(2,3)" />
                  <path d={D_PATH} fill="url(#gearFace)" stroke={`${RED}77`} strokeWidth={1} />
  
                  {/* corner technical connectors */}
                  {CONNECTORS.map((c, i) => (
                    <g key={i}>
                      <line
                        x1={c.dot.x}
                        y1={c.dot.y}
                        x2={c.tip.x}
                        y2={c.tip.y}
                        stroke={`${CONNECTOR_COLORS[i]}40`}
                        strokeWidth={1}
                      />
                      <motion.circle
                        cx={c.dot.x}
                        cy={c.dot.y}
                        r={2.5}
                        fill={CONNECTOR_COLORS[i]}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                      />
                    </g>
                  ))}
                </svg>
              </motion.div>
            </div>
  
            <motion.div style={{ opacity: labelsOpacity }}>
              {heroContent.annotations.map((label, i) => (
                <motion.div
                  key={label}
                  className={[
                    'absolute flex select-none items-center gap-1.5',
                    i === 0 && 'left-0 top-0',
                    i === 1 && 'right-0 top-8',
                    i === 2 && 'bottom-8 left-0',
                    i === 3 && 'bottom-0 right-0',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  variants={reveal(1.0 + i * 0.08, 0.6, 8)}
                  initial="hidden"
                  animate={animate}
                >
                  <motion.span
                    className="h-1 w-1 rounded-full"
                    style={{ backgroundColor: i === heroContent.annotations.length - 1 ? BRIGHT_RED : RED }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1.0 + i * 0.08 }}
                  />
                  <span
                    className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#9a9a9a]"
                    style={{ fontFamily: BODY_FONT }}
                  >
                    {label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-2"
        variants={reveal(1.7, 0.7, 12)}
        initial="hidden"
        animate={animate}
      >
        <span
          className="select-none text-[10px] font-medium uppercase tracking-[0.25em] text-white/45"
          style={{ fontFamily: BODY_FONT }}
        >
          {heroContent.scrollLabel}
        </span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
          <ChevronDown size={16} className="text-white/40" />
        </motion.div>
      </motion.div>
    </section>
  )
}
