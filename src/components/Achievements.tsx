import { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import AchievementCard from './AchievementCard'
import DinobotsSectionHeading from './DinobotsSectionHeading'
import { achievementsContent, type AchievementEntry } from '../content/achievements'
import { achievementService } from '../services/achievementService'
import { useSiteSettings } from '../hooks/useSiteSettings'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

// Card entrance stagger: heading first, then each card in sequence — see
// content/achievements.ts for the data these delays pace.
const CARD_DELAYS = [0.26, 0.37, 0.48, 0.59, 0.7, 0.81]

const headingReveal: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.85, ease: EASE_OUT } },
}

interface AchievementsProps {
  /** True as soon as the Projects → Achievements transition begins (and
   *  while resting on Achievements) — drives the heading/card entrance
   *  stagger. Not scroll-observed: this scene is reached via the same
   *  discrete scene-transition system as Hero → About → Projects. */
  active: boolean
}

export default function Achievements({ active }: AchievementsProps) {
  const animate = active ? 'visible' : 'hidden'
  const settings = useSiteSettings()

  // Starts from the existing hardcoded copy (so the section renders
  // identically before the fetch resolves and if the backend is ever
  // unreachable), then swaps in live data from MongoDB once it arrives.
  const [achievements, setAchievements] = useState<AchievementEntry[]>(achievementsContent.achievements)

  useEffect(() => {
    let cancelled = false
    achievementService.getPublicAchievements().then((data) => {
      if (cancelled || data === null) return
      setAchievements(
        data.map((achievement) => ({
          image: achievement.image,
          alt: achievement.title || 'Dinobots achievement',
        }))
      )
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden" style={{ backgroundColor: '#090606' }}>
      {/* Full-bleed background photo — subtly blurred so it stays an
          environment, not a competing focal point. This layer alone carries
          the blur; heading/cards below are plain siblings and stay sharp. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url('${achievementsContent.background}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(3px)',
        }}
      />
      {/* Cinematic dark-copper treatment: flat wash + warm vignette, image
          stays visible underneath. */}
      <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: 'rgba(9,6,6,0.62)' }} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at center, rgba(169,95,61,0.16) 0%, rgba(9,6,6,0.4) 55%, rgba(9,6,6,0.78) 100%)',
        }}
      />

      <div className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center gap-[clamp(0.75rem,2.5vh,2rem)] px-6 pb-[clamp(0.75rem,2.5vh,2rem)] pt-[clamp(4.5rem,11.5vh,6rem)] lg:px-12">
        <motion.div className="flex flex-col items-center text-center" initial="hidden" animate={animate}>
          <DinobotsSectionHeading variants={headingReveal} className="text-[clamp(2rem,5vw,3.5rem)]">
            {settings.achievementsSectionTitle}
          </DinobotsSectionHeading>
          {settings.achievementsIntro && (
            <motion.p
              variants={headingReveal}
              className="mt-4 max-w-2xl text-sm leading-relaxed sm:text-base"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: 'rgba(230,220,210,0.72)' }}
            >
              {settings.achievementsIntro}
            </motion.p>
          )}
        </motion.div>

        <motion.div
          className="grid w-full max-w-6xl grid-cols-1 place-items-center gap-[clamp(0.75rem,2vh,1.5rem)] sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate={animate}
        >
          {achievements.map((achievement, i) => (
            <AchievementCard key={i} achievement={achievement} delay={CARD_DELAYS[i] ?? 0.81} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
