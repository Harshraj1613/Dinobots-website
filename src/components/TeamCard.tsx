import { motion, type Variants } from 'framer-motion'
import type { TeamMember } from '../content/team'
import { getImageUrl } from '../utils/imageUrl'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

export const HEADING_FONT = "'Unbounded', sans-serif"

// Cool steel/ice-blue identity, matched to the Team background photo's own
// cinematic rim-lighting — deliberately distinct from Achievements' copper.
// Exported so the card-detail overlay (Team.tsx) can render the enlarged
// card in the exact same visual language without duplicating the palette.
export const PRIMARY = '#EDF3F5'
export const GLOW = '#3E6A80'
export const BORDER = 'rgba(143,199,222,0.22)'
export const BORDER_HOVER = 'rgba(205,234,245,0.55)'

const card = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 60, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, delay, ease: EASE_OUT } },
})

// Every card currently shows the same temporary placeholder photo. Cropped
// identically via object-cover, that repetition tiles into what reads as a
// continuous band running across the whole row — the "connector line"
// effect. Cycling the focal point per member breaks that illusion without
// touching the image asset itself; swap this out once real member photos
// land (object-position stops mattering once each card has a unique image).
export const FOCAL_POINTS = [
  '30% 25%',
  '68% 30%',
  '50% 55%',
  '20% 65%',
  '80% 60%',
  '40% 20%',
  '60% 75%',
  '15% 40%',
  '85% 45%',
  '50% 80%',
]

interface TeamCardProps {
  member: TeamMember
  active: boolean
  delay: number
  /** Trailing spacing utility classes — see TeamMarqueeRow for why this is
   *  margin on every card rather than a `gap` on the track. */
  spacingClassName?: string
  /** Member's position within the row — picks a stable focal point so
   *  the two duplicated copies in the marquee track render identically. */
  focalIndex: number
  /** Opens this member's card-detail overlay. Omitted where the card is
   *  purely decorative (none currently, but keeps the component reusable). */
  onSelect?: (member: TeamMember, cardRect: DOMRect) => void
}

export default function TeamCard({ member, active, delay, spacingClassName = '', focalIndex, onSelect }: TeamCardProps) {
  const handleActivate = (event: { currentTarget: HTMLElement }) => {
    onSelect?.(member, event.currentTarget.getBoundingClientRect())
  }

  return (
    <motion.article
      variants={card(delay)}
      initial="hidden"
      animate={active ? 'visible' : 'hidden'}
      onClick={onSelect ? handleActivate : undefined}
      onKeyDown={
        onSelect
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleActivate(event)
              }
            }
          : undefined
      }
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? `View ${member.name}'s profile` : undefined}
      className={`group relative w-[min(80vw,41vh)] max-w-[320px] shrink-0 sm:w-[min(36vw,29vh)] lg:w-[min(26vw,27vh)] ${onSelect ? 'cursor-pointer' : ''} ${spacingClassName}`}
    >
      {/* Soft steel/ice-blue glow behind the card, hover-only. */}
      <div
        aria-hidden="true"
        className="absolute -inset-3 rounded-[24px] opacity-0 blur-2xl transition-opacity duration-[400ms] ease-out group-hover:opacity-40"
        style={{ backgroundColor: GLOW }}
      />

      <div
        className="relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-[20px] border shadow-[0_18px_45px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-[380ms] ease-out group-hover:-translate-y-1 group-hover:scale-[1.02]"
        style={{ borderColor: BORDER, backgroundColor: 'rgba(5,8,11,0.55)' }}
      >
        <div className="relative h-[88%] w-full overflow-hidden">
          <img
            src={getImageUrl(member.image)}
            alt={member.name}
            className="h-full w-full object-cover transition-transform duration-[380ms] ease-out group-hover:scale-[1.02]"
            style={{ objectPosition: FOCAL_POINTS[focalIndex % FOCAL_POINTS.length] }}
          />
        </div>

        <div className="flex h-[12%] w-full items-center justify-center px-2">
          <span
            className="truncate text-center text-sm font-semibold uppercase tracking-[0.08em]"
            style={{ fontFamily: HEADING_FONT, color: PRIMARY }}
          >
            {member.name}
          </span>
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[20px] border opacity-0 transition-opacity duration-[380ms] ease-out group-hover:opacity-100"
          style={{ borderColor: BORDER_HOVER }}
        />
      </div>
    </motion.article>
  )
}
