import { motion, useReducedMotion } from 'framer-motion'

// Abstract mechanical/blueprint wireframe — related to Hero's gear (same
// red/steel material logic) but a different form entirely: layered
// wireframe rings + a hex core + a slow rotating red sweep, no teeth.
// Shared by JoinUs (desktop, interactive) and JoinUsBackground (mobile,
// dimmed, behind the hero text).
export default function HeroMechanicalVisual({ reduceInteractivity = false }: { reduceInteractivity?: boolean }) {
  const reduceMotion = useReducedMotion() || reduceInteractivity

  return (
    <div className="relative aspect-square w-full">
      <svg viewBox="0 0 400 400" className="h-full w-full" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="joinUsSweep" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="rgba(227,34,46,0.28)" />
            <stop offset="60%" stopColor="rgba(181,18,27,0.08)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        {/* Slow rotating red sweep. */}
        <motion.g
          style={{ transformOrigin: '200px 200px' }}
          animate={reduceMotion ? {} : { rotate: 360 }}
          transition={reduceMotion ? undefined : { duration: 50, repeat: Infinity, ease: 'linear' }}
        >
          <rect x="180" y="20" width="40" height="180" fill="url(#joinUsSweep)" />
        </motion.g>

        {/* Outer dashed wireframe ring — slow rotation. */}
        <motion.circle
          cx="200"
          cy="200"
          r="176"
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1"
          strokeDasharray="3 10"
          style={{ transformOrigin: '200px 200px' }}
          animate={reduceMotion ? {} : { rotate: 360 }}
          transition={reduceMotion ? undefined : { duration: 90, repeat: Infinity, ease: 'linear' }}
        />

        {/* Middle solid ring — counter-rotation. */}
        <motion.circle
          cx="200"
          cy="200"
          r="140"
          fill="none"
          stroke="rgba(181,18,27,0.4)"
          strokeWidth="1"
          style={{ transformOrigin: '200px 200px' }}
          animate={reduceMotion ? {} : { rotate: -360 }}
          transition={reduceMotion ? undefined : { duration: 70, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner hexagon wireframe core. */}
        <motion.polygon
          points="200,90 287,145 287,255 200,310 113,255 113,145"
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.2"
          style={{ transformOrigin: '200px 200px' }}
          animate={reduceMotion ? {} : { rotate: 360 }}
          transition={reduceMotion ? undefined : { duration: 46, repeat: Infinity, ease: 'linear' }}
        />

        {/* Center emblem. */}
        <circle cx="200" cy="200" r="30" fill="none" stroke="#E3222E" strokeWidth="1.4" />
        <circle cx="200" cy="200" r="4" fill="#E3222E" />

        {/* Corner technical ticks. */}
        {[
          [60, 60],
          [340, 60],
          [60, 340],
          [340, 340],
        ].map(([x, y], i) => (
          <g key={i}>
            <line x1={x} y1={y} x2={x + (x < 200 ? 26 : -26)} y2={y} stroke="rgba(181,18,27,0.5)" strokeWidth="1" />
            <line x1={x} y1={y} x2={x} y2={y + (y < 200 ? 26 : -26)} stroke="rgba(181,18,27,0.5)" strokeWidth="1" />
          </g>
        ))}
      </svg>
    </div>
  )
}
