import { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import EventNoticeCard from './EventNoticeCard'
import EventJoinModal from './EventJoinModal'
import DinobotsSectionHeading from './DinobotsSectionHeading'
import { eventsContent, type EventEntry } from '../content/events'
import { eventService } from '../services/eventService'
import { useSiteSettings } from '../hooks/useSiteSettings'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const headingReveal: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.85, ease: EASE_OUT } },
}

const BODY_FONT = "'IBM Plex Sans', sans-serif"

interface EventsProps {
  /** True as soon as the About → Events transition begins (and while
   *  resting on Events) — drives the heading/card entrance stagger. Not
   *  scroll-observed: this scene is reached via the same discrete
   *  scene-transition system as every other cinematic scene. */
  active: boolean
}

export default function Events({ active }: EventsProps) {
  const animate = active ? 'visible' : 'hidden'
  const settings = useSiteSettings()

  // Starts from the (empty) fallback content so the section renders
  // gracefully before the fetch resolves and if the backend is ever
  // unreachable, then swaps in live data from MongoDB once it arrives —
  // same pattern as Projects/Achievements.
  const [events, setEvents] = useState<EventEntry[]>(eventsContent.events)
  const [joiningEvent, setJoiningEvent] = useState<EventEntry | null>(null)

  useEffect(() => {
    let cancelled = false
    eventService.getPublicEvents().then((data) => {
      if (cancelled || data === null) return
      setEvents(
        data.map((event) => ({
          id: event.id,
          name: event.name,
          shortDescription: event.shortDescription,
          fullDescription: event.fullDescription,
          eventDate: event.eventDate,
          eventTime: event.eventTime,
          location: event.location,
          registrationOpen: event.registrationOpen,
          deadline: event.deadline,
          image: event.image,
        }))
      )
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden" style={{ backgroundColor: '#0D0906' }}>
      {/* Full-bleed background photo — the exact existing Events asset,
          subtly blurred so it stays an environment, not a competing focal
          point. This layer alone carries the blur; heading/cards stay sharp. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url('${eventsContent.background}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(3px)',
        }}
      />
      {/* Cinematic dark-bronze treatment: flat wash + warm amber/copper
          vignette, image stays visible underneath — deliberately warm
          (bronze/copper/amber), never blue/cyan/purple/green. */}
      <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: 'rgba(13,9,6,0.6)' }} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at center, rgba(196,120,58,0.16) 0%, rgba(13,9,6,0.42) 55%, rgba(13,9,6,0.8) 100%)',
        }}
      />

      <div className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center gap-[clamp(0.75rem,2.5vh,2rem)] px-6 pb-[clamp(0.75rem,2.5vh,2rem)] pt-[clamp(4.5rem,11.5vh,6rem)] lg:px-12">
        <motion.div className="flex flex-col items-center text-center" initial="hidden" animate={animate}>
          <DinobotsSectionHeading variants={headingReveal} className="text-[clamp(2rem,5vw,3.5rem)]">
            {settings.eventsSectionTitle}
          </DinobotsSectionHeading>
          {settings.eventsIntro && (
            <motion.p
              variants={headingReveal}
              className="mt-4 max-w-2xl text-sm leading-relaxed sm:text-base"
              style={{ fontFamily: BODY_FONT, color: 'rgba(230,220,205,0.72)' }}
            >
              {settings.eventsIntro}
            </motion.p>
          )}
        </motion.div>

        {events.length === 0 ? (
          <motion.p
            initial="hidden"
            animate={animate}
            variants={headingReveal}
            className="max-w-md text-center text-sm"
            style={{ fontFamily: BODY_FONT, color: 'rgba(230,220,205,0.6)' }}
          >
            No events are open right now — check back soon.
          </motion.p>
        ) : (
          <motion.div
            className="grid w-full max-w-6xl grid-cols-1 place-items-stretch gap-[clamp(0.75rem,2vh,1.5rem)] sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate={animate}
          >
            {events.map((event, i) => (
              <EventNoticeCard
                key={event.id}
                event={event}
                delay={0.15 + i * 0.11}
                onJoin={setJoiningEvent}
                ctaText={settings.eventsCtaText}
              />
            ))}
          </motion.div>
        )}
      </div>

      <EventJoinModal event={joiningEvent} onClose={() => setJoiningEvent(null)} />
    </section>
  )
}
