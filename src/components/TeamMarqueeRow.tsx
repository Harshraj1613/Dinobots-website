import TeamCard from './TeamCard'
import type { TeamMember } from '../content/team'

// Stagger between each card's own entrance within a row — applied modulo
// the row length so the duplicated tail (needed for the seamless loop,
// see index.css) reuses the same timing rather than doubling the reveal.
const CARD_STAGGER = 0.09

interface TeamMarqueeRowProps {
  members: TeamMember[]
  /** Seconds for one full pass of the row's own member set. */
  duration: number
  active: boolean
  /** Entrance delay (seconds) before this row's first card starts revealing. */
  baseDelay: number
  /** Opens a member's card-detail overlay; forwarded to every card. */
  onSelect?: (member: TeamMember, cardRect: DOMRect) => void
}

export default function TeamMarqueeRow({ members, duration, active, baseDelay, onSelect }: TeamMarqueeRowProps) {
  // Render the row twice back-to-back so a CSS transform of exactly -50%
  // of the doubled track lines the second copy up perfectly with where the
  // first one started — an infinite, seamless loop with no visible reset.
  //
  // Spacing is trailing margin on every card rather than a flex `gap` on
  // the track: with N items a `gap` only inserts N-1 gaps, so the doubled
  // track's true midpoint (the start of the second copy) sits half a gap
  // off from -50% of the total width — a small but real seam. Giving every
  // card (including the last) the same trailing margin makes each item's
  // box a uniform width, so the track's total width is exactly 2x one
  // copy's width and -50% lands exactly on the seam.
  const track = [...members, ...members]

  return (
    // Horizontal clipping is required for the marquee window; the vertical
    // padding below is NOT clipped by `overflow-hidden` (only content past
    // the padding box is), so it exists purely to give a hovered card's
    // scale/lift/glow room to render fully instead of being cut off at the
    // row's own top/bottom edge.
    <div className="relative w-full overflow-hidden py-4 lg:py-5">
      <div
        className="team-marquee-track flex w-max"
        style={{ animation: `team-marquee-ltr ${duration}s linear infinite` }}
      >
        {track.map((member, i) => (
          <TeamCard
            key={`${member.name}-${i}`}
            member={member}
            active={active}
            delay={baseDelay + (i % members.length) * CARD_STAGGER}
            spacingClassName="mr-5 lg:mr-8"
            focalIndex={i % members.length}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
