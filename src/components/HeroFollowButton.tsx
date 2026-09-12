import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { footerContent } from '../content/footer'
import { useSiteSettings } from '../hooks/useSiteSettings'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

// Same labels as the Footer's social buttons; the destination URL comes
// from Site Settings (live in MongoDB) so both components read from the
// exact same single source instead of duplicating hardcoded URLs.
const SOCIAL_LABELS = footerContent.social.filter((social) => social.icon === 'instagram' || social.icon === 'linkedin')

// Same pill treatment as Hero's existing secondary CTA ("OUR PROJECTS") —
// applied to all three buttons here so the revealed pair reads as part of
// the same button family, not a new visual language.
const PILL_CLASSNAME =
  'rounded-full border border-white/20 px-7 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e3222e88] hover:bg-[#e3222e0d] hover:text-[#f7dcdc]'

interface HeroFollowButtonProps {
  /** Button text, e.g. "FOLLOW" — configurable via Admin → Settings → Home. */
  label: string
}

export default function HeroFollowButton({ label }: HeroFollowButtonProps) {
  const [expanded, setExpanded] = useState(false)
  const reduceMotion = useReducedMotion()
  const settings = useSiteSettings()

  const socialLinks = SOCIAL_LABELS.map((social) => ({
    ...social,
    href: social.icon === 'instagram' ? settings.instagramUrl : settings.linkedinUrl,
  }))

  const linkVariants = (delay: number): Variants =>
    reduceMotion
      ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
      : {
          hidden: { opacity: 0, x: -14 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.4, delay, ease: EASE_OUT } },
          exit: { opacity: 0, x: -14, transition: { duration: 0.25, ease: EASE_OUT } },
        }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-label={expanded ? 'Hide social links' : 'Show social links'}
        className={PILL_CLASSNAME}
      >
        {label} →
      </button>

      <AnimatePresence>
        {expanded &&
          socialLinks.map((social, i) => (
            <motion.a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={linkVariants(i * 0.08)}
              className={PILL_CLASSNAME}
            >
              {social.label}
            </motion.a>
          ))}
      </AnimatePresence>
    </div>
  )
}
