import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import TeamMarqueeRow from './TeamMarqueeRow'
import DinobotsSectionHeading from './DinobotsSectionHeading'
import { BORDER_HOVER, FOCAL_POINTS, GLOW, HEADING_FONT, PRIMARY } from './TeamCard'
import { teamContent, type TeamMember } from '../content/team'
import { teamService } from '../services/teamService'
import { getImageUrl } from '../utils/imageUrl'
import { useSiteSettings } from '../hooks/useSiteSettings'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const headingReveal: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.85, ease: EASE_OUT } },
}

/** Where, relative to the Team section's own center, the clicked card sat —
 *  the detail overlay animates in from this point instead of teleporting in,
 *  so the expansion reads as coming from wherever the user actually clicked. */
interface Origin {
  x: number
  y: number
}

interface SelectedMember {
  member: TeamMember
  origin: Origin
}

interface TeamProps {
  /** True as soon as the Achievements → Team transition begins (and while
   *  resting on Team) — drives the heading/row entrance stagger. Not
   *  scroll-observed: this scene is reached via the same discrete
   *  scene-transition system as every section before it. */
  active: boolean
}

export default function Team({ active }: TeamProps) {
  const animate = active ? 'visible' : 'hidden'
  const settings = useSiteSettings()
  const sectionRef = useRef<HTMLElement>(null)
  const [selected, setSelected] = useState<SelectedMember | null>(null)

  // Starts from the existing hardcoded roster (so the section renders
  // identically before the fetch resolves and if the backend is ever
  // unreachable), then swaps in the live roster from MongoDB once it
  // arrives.
  const [members, setMembers] = useState<TeamMember[]>(teamContent.members)

  useEffect(() => {
    let cancelled = false
    teamService.getPublicTeam().then((data) => {
      if (cancelled || data === null) return
      setMembers(data.map((m) => ({ name: m.name, image: m.image, post: m.post, description: m.description })))
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selected) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selected])

  const handleSelect = (member: TeamMember, cardRect: DOMRect) => {
    const sectionRect = sectionRef.current?.getBoundingClientRect()
    const origin = sectionRect
      ? {
          x: cardRect.left + cardRect.width / 2 - (sectionRect.left + sectionRect.width / 2),
          y: cardRect.top + cardRect.height / 2 - (sectionRect.top + sectionRect.height / 2),
        }
      : { x: 0, y: 0 }
    setSelected({ member, origin })
  }

  const handleClose = () => setSelected(null)

  const selectedFocalPoint = selected
    ? FOCAL_POINTS[members.findIndex((m) => m.name === selected.member.name) % FOCAL_POINTS.length]
    : undefined

  return (
    <section ref={sectionRef} className="relative min-h-[100dvh] w-full overflow-hidden" style={{ backgroundColor: '#05080B' }}>
      {/* Full-bleed background photo — subtly blurred so it stays an
          environment, not a competing focal point. This layer alone carries
          the blur; heading/cards below are plain siblings and stay sharp. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url('${teamContent.background}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(3px)',
        }}
      />
      {/* Cinematic dark treatment: flat wash + cool ice-blue vignette,
          matched to the background photo's own rim-lighting. */}
      <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: 'rgba(5,8,11,0.66)' }} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at center, rgba(143,199,222,0.14) 0%, rgba(5,8,11,0.4) 55%, rgba(5,8,11,0.8) 100%)',
        }}
      />

      <div className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center gap-6 pb-6 pt-20 lg:gap-10 lg:pb-8 lg:pt-24">
        {/* Heading + marquee dim/blur together while a card is expanded —
            the transition is a plain CSS filter on these wrapper divs, kept
            separate from the heading's own entrance `filter` animation and
            from the marquee's CSS keyframe, so neither is interrupted. */}
        <div
          className="transition-[filter,opacity] duration-500 ease-out"
          style={{ filter: selected ? 'blur(5px)' : 'blur(0px)', opacity: selected ? 0.45 : 1 }}
        >
          <motion.div className="flex flex-col items-center px-6 text-center" initial="hidden" animate={animate}>
            <DinobotsSectionHeading variants={headingReveal} className="text-[clamp(1.75rem,4vw,3rem)]">
              {settings.teamSectionTitle}
            </DinobotsSectionHeading>
            {settings.teamIntro && (
              <motion.p
                variants={headingReveal}
                className="mt-3 max-w-2xl text-sm leading-relaxed sm:text-base"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: 'rgba(237,243,245,0.65)' }}
              >
                {settings.teamIntro}
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Single left→right looping marquee row — the CSS track animation
            runs continuously (see TeamMarqueeRow/index.css) regardless of
            `active` AND regardless of `selected`: opening a card only dims
            and blurs this wrapper, it never touches the animation itself. */}
        <div
          className={`flex w-full items-center justify-center transition-[filter,opacity] duration-500 ease-out ${selected ? 'pointer-events-none' : ''}`}
          style={{ filter: selected ? 'blur(5px)' : 'blur(0px)', opacity: selected ? 0.4 : 1 }}
        >
          <TeamMarqueeRow members={members} duration={68} active={active} baseDelay={0.3} onSelect={handleSelect} />
        </div>
      </div>

      {/* Card-detail overlay: a sibling layer above the (blurred) heading and
          marquee, so the moving track's duplicate of the selected member
          never shows through or overlaps the enlarged card/info panel. */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="team-detail-overlay"
            className="absolute inset-0 z-30 flex items-center justify-center px-6 py-16 lg:px-16"
            style={{ backgroundColor: 'rgba(5,8,11,0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <motion.div
              className="flex w-full max-w-5xl flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-14"
              initial={{ opacity: 0, scale: 0.5, x: selected.origin.x, y: selected.origin.y }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: selected.origin.x, y: selected.origin.y }}
              transition={{ duration: 0.7, ease: EASE_OUT }}
            >
              {/* Enlarged card — same image, aspect ratio, rounded corners,
                  border and glow language as the marquee card, just bigger. */}
              <div className="relative w-[min(72vw,300px)] shrink-0 sm:w-[min(50vw,320px)] lg:w-[38%] lg:max-w-[380px]">
                <div
                  aria-hidden="true"
                  className="absolute -inset-4 rounded-[28px] opacity-45 blur-2xl"
                  style={{ backgroundColor: GLOW }}
                />
                <div
                  className="relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-[24px] border shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-md"
                  style={{ borderColor: BORDER_HOVER, backgroundColor: 'rgba(5,8,11,0.55)' }}
                >
                  <div className="relative h-[88%] w-full overflow-hidden">
                    <img
                      src={getImageUrl(selected.member.image)}
                      alt={selected.member.name}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: selectedFocalPoint }}
                    />
                  </div>
                  <div className="flex h-[12%] w-full items-center justify-center px-2">
                    <span
                      className="truncate text-center text-sm font-semibold uppercase tracking-[0.08em]"
                      style={{ fontFamily: HEADING_FONT, color: PRIMARY }}
                    >
                      {selected.member.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info panel — name (largest) → post (distinct accent) →
                  short description, in a clean vertical hierarchy. */}
              <motion.div
                className="flex w-full max-w-md flex-col items-center gap-3 text-center lg:w-[42%] lg:max-w-none lg:items-start lg:text-left"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.6, delay: 0.15, ease: EASE_OUT }}
              >
                <h3
                  className="text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold uppercase tracking-tight"
                  style={{ fontFamily: HEADING_FONT, color: PRIMARY }}
                >
                  {selected.member.name}
                </h3>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm"
                  style={{ color: '#8FC7DE' }}
                >
                  {selected.member.post}
                </p>
                <p
                  className="max-w-sm text-sm leading-relaxed"
                  style={{ color: 'rgba(237,243,245,0.75)' }}
                >
                  {selected.member.description}
                </p>
              </motion.div>
            </motion.div>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close member profile"
              className="absolute right-5 top-24 flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200 hover:bg-white/10 lg:right-8 lg:top-28"
              style={{ borderColor: BORDER_HOVER, color: PRIMARY }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
