import { motion, type Variants } from 'framer-motion'
import type { AchievementEntry } from '../content/achievements'
import { getImageUrl } from '../utils/imageUrl'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const GLOW = '#7A3F2A'
const BORDER = 'rgba(190,105,70,0.25)'
const BORDER_HOVER = 'rgba(213,138,99,0.55)'

const card = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 60, scale: 0.97, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.75, delay, ease: EASE_OUT } },
})

interface AchievementCardProps {
  achievement: AchievementEntry
  delay: number
}

export default function AchievementCard({ achievement, delay }: AchievementCardProps) {
  return (
    <motion.div variants={card(delay)} className="group relative aspect-[4/3] w-full max-w-[420px] lg:max-w-[clamp(220px,42vh,420px)]">
      {/* Soft copper/bronze glow behind the card, hover-only. */}
      <div
        aria-hidden="true"
        className="absolute -inset-3 rounded-[26px] opacity-0 blur-2xl transition-opacity duration-[400ms] ease-out group-hover:opacity-40"
        style={{ backgroundColor: GLOW }}
      />

      <div
        className="relative h-full w-full overflow-hidden rounded-[20px] border shadow-[0_18px_45px_rgba(0,0,0,0.5)] transition-all duration-[380ms] ease-out group-hover:-translate-y-1 group-hover:scale-[1.02]"
        style={{ borderColor: BORDER, backgroundColor: 'rgba(9,6,6,0.4)' }}
      >
        <img
          src={getImageUrl(achievement.image)}
          alt={achievement.alt}
          className="h-full w-full object-cover transition-transform duration-[380ms] ease-out group-hover:scale-[1.03]"
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[20px] border opacity-0 transition-opacity duration-[380ms] ease-out group-hover:opacity-100"
          style={{ borderColor: BORDER_HOVER }}
        />
      </div>
    </motion.div>
  )
}
