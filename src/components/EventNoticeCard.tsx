import { motion, type Variants } from 'framer-motion'
import type { EventEntry } from '../content/events'
import { getImageUrl } from '../utils/imageUrl'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const HEADING_FONT = "'Unbounded', sans-serif"
const BODY_FONT = "'IBM Plex Sans', sans-serif"
const LABEL_FONT = "'Inter', sans-serif"

// Warm bronze/copper industrial palette — deliberately no blue/cyan/purple/
// green anywhere in this card, matching the Events section's amber/copper
// atmosphere (see components/Events.tsx).
const GLOW = '#8A5A2E'
const BORDER = 'rgba(201,158,104,0.28)'
const BORDER_HOVER = 'rgba(224,180,120,0.55)'
const AMBER = '#D98C3D'
const IVORY = '#F1E9DD'
const MUTED_IVORY = 'rgba(230,220,205,0.65)'
const CLOSED_GREY = '#8C8577'

const card = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 50, scale: 0.97, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.75, delay, ease: EASE_OUT } },
})

function formatEventDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

interface EventNoticeCardProps {
  event: EventEntry
  delay: number
  onJoin: (event: EventEntry) => void
  /** e.g. "JOIN EVENT" — configurable via Admin → Settings → Events. */
  ctaText: string
}

export default function EventNoticeCard({ event, delay, onJoin, ctaText }: EventNoticeCardProps) {
  const dateLabel = formatEventDate(event.eventDate)
  const dateTimeLabel = event.eventTime ? `${dateLabel} · ${event.eventTime}` : dateLabel

  return (
    <motion.article variants={card(delay)} className="group relative w-full max-w-[440px]">
      {/* Soft copper glow behind the card, hover-only — same technique
          family as ProjectCard/AchievementCard. */}
      <div
        aria-hidden="true"
        className="absolute -inset-3 rounded-[26px] opacity-0 blur-2xl transition-opacity duration-[380ms] ease-out group-hover:opacity-35"
        style={{ backgroundColor: GLOW }}
      />

      <div
        className="relative flex h-full flex-col overflow-hidden rounded-[22px] border shadow-[0_18px_45px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-[380ms] ease-out group-hover:-translate-y-1 group-hover:scale-[1.02]"
        style={{ backgroundColor: 'rgba(13,9,6,0.62)', borderColor: BORDER }}
      >
        {event.image && (
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
            <img
              src={getImageUrl(event.image)}
              alt={event.name}
              className="h-full w-full object-cover transition-transform duration-[420ms] ease-out group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: 'rgba(10,7,5,0.2)' }} />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3 px-6 py-6">
          <div className="flex items-center justify-between gap-3">
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.28em]"
              style={{ fontFamily: LABEL_FONT, color: AMBER }}
            >
              EVENT
            </span>
            <span
              className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ fontFamily: LABEL_FONT, color: event.registrationOpen ? AMBER : CLOSED_GREY }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: event.registrationOpen ? AMBER : CLOSED_GREY }}
              />
              {event.registrationOpen ? 'REGISTRATION OPEN' : 'REGISTRATION CLOSED'}
            </span>
          </div>

          <h3 className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: HEADING_FONT, color: IVORY }}>
            {event.name}
          </h3>

          {dateTimeLabel && (
            <span className="text-[12px] font-medium uppercase tracking-[0.08em]" style={{ fontFamily: BODY_FONT, color: AMBER }}>
              {dateTimeLabel}
            </span>
          )}

          <p
            className="text-sm leading-relaxed [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden"
            style={{ fontFamily: BODY_FONT, color: MUTED_IVORY }}
          >
            {event.shortDescription}
          </p>

          {event.location && (
            <span className="text-[12px]" style={{ fontFamily: BODY_FONT, color: MUTED_IVORY }}>
              📍 {event.location}
            </span>
          )}

          <button
            type="button"
            disabled={!event.registrationOpen}
            onClick={() => onJoin(event)}
            className="mt-2 inline-flex items-center justify-center gap-2 self-start rounded-lg border px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-45 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(217,140,61,0.28)]"
            style={{ borderColor: 'rgba(217,140,61,0.55)', backgroundColor: 'rgba(10,7,5,0.5)', color: IVORY, fontFamily: BODY_FONT }}
          >
            {event.registrationOpen ? `${ctaText} →` : 'REGISTRATION CLOSED'}
          </button>
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[22px] border opacity-0 transition-opacity duration-[380ms] ease-out group-hover:opacity-100"
          style={{ borderColor: BORDER_HOVER }}
        />
      </div>
    </motion.article>
  )
}
