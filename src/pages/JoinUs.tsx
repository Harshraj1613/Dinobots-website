import { useEffect } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import Footer from '../components/Footer'
import WhyDinobots from '../components/joinus/WhyDinobots'
import DomainSelector from '../components/joinus/DomainSelector'
import ApplicationForm from '../components/joinus/ApplicationForm'
import JoinUsBackground from '../components/joinus/JoinUsBackground'
import JoinUsHeader from '../components/joinus/JoinUsHeader'
import BackButton from '../components/joinus/BackButton'
import HeroMechanicalVisual from '../components/joinus/HeroMechanicalVisual'
import { joinUsFinalCta, joinUsHero } from '../content/joinUs'
import { BRAND_HEADING_CLASSNAME, brandHeadingStyle } from '../styles/brandHeading'
import { useSiteSettings } from '../hooks/useSiteSettings'

const EASE_OUT = [0.22, 1, 0.36, 1] as const
const BODY_FONT = "'Inter', sans-serif"
const DESCRIPTION_FONT = "'IBM Plex Sans', sans-serif"

// DARK STEEL × ELECTRIC RED — deliberately its own base tone (gunmetal, not
// Footer/Hero's near-black) so this page reads as related to, not a copy
// of, the rest of the site.
const STEEL_0 = '#111315'
const RED = '#B5121B'
const BRIGHT_RED = '#E3222E'

// The complete /join-us page — a single normal scrolling document, not a
// set of separate routes/views. "Explore Domains" and "Apply Now" are just
// in-page sections (#domains, #apply); their hero buttons smooth-scroll to
// them rather than navigating anywhere.
export default function JoinUs() {
  const reduceMotion = useReducedMotion()
  const settings = useSiteSettings()
  const heroSubtitleLines = settings.joinUsHeroSubtitle ? settings.joinUsHeroSubtitle.split('\n') : joinUsHero.tagline

  // Scopes the scrollbar-hiding rules in index.css (`html.join-us-page`) to
  // exactly this route — added to <html> only while this page is mounted,
  // removed on unmount, so the homepage/admin scrollbar is never touched.
  // The document itself is never made non-scrollable here: this only hides
  // the scrollbar's paint, it doesn't set `overflow: hidden` anywhere.
  useEffect(() => {
    document.documentElement.classList.add('join-us-page')
    return () => {
      document.documentElement.classList.remove('join-us-page')
    }
  }, [])

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  const reveal = (delay: number, distance = 26): Variants =>
    reduceMotion
      ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
      : {
          hidden: { opacity: 0, y: distance, filter: 'blur(6px)' },
          visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, delay, ease: EASE_OUT } },
        }

  const lineReveal = (delay: number): Variants =>
    reduceMotion
      ? { hidden: { scaleX: 1 }, visible: { scaleX: 1 } }
      : { hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: 1, delay, ease: EASE_OUT } } }

  return (
    <div className="relative w-full overflow-x-hidden" style={{ backgroundColor: STEEL_0 }}>
      <JoinUsHeader />

      {/* ============================== HERO (#join) ============================== */}
      <section id="join" className="relative flex min-h-[100dvh] w-full items-center overflow-hidden">
        <JoinUsBackground showMobileHeroVisual />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-16 pt-28 lg:grid-cols-2 lg:gap-12 lg:px-12 lg:pt-24">
          <div className="flex flex-col items-start">
            <motion.div initial="hidden" animate="visible" variants={reveal(0)}>
              <BackButton label="BACK TO DINOBOTS" to="/#home" />
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={reveal(0.08)} className="mt-6 flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: BRIGHT_RED }} />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.3em]"
                style={{ fontFamily: DESCRIPTION_FONT, color: 'rgba(215,215,215,0.6)' }}
              >
                RECRUITMENT OPEN
              </span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={reveal(0.18)}
              className={`mt-5 text-[clamp(2.5rem,6.5vw,5rem)] leading-[0.98] ${BRAND_HEADING_CLASSNAME}`}
              style={brandHeadingStyle}
            >
              {settings.joinUsHeroTitle}
            </motion.h1>

            <motion.div initial="hidden" animate="visible" variants={reveal(0.3)} className="mt-5 flex flex-col gap-1">
              {heroSubtitleLines.map((line) => (
                <span
                  key={line}
                  className="text-base font-medium uppercase tracking-[0.1em] sm:text-lg"
                  style={{ fontFamily: BODY_FONT, color: '#D7D7D7' }}
                >
                  {line}
                </span>
              ))}
            </motion.div>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={reveal(0.42)}
              className="mt-7 max-w-[460px] text-base leading-relaxed"
              style={{ fontFamily: DESCRIPTION_FONT, color: 'rgba(215,215,215,0.7)' }}
            >
              {settings.joinUsHeroDescription}
            </motion.p>

            <motion.div initial="hidden" animate="visible" variants={reveal(0.54)} className="mt-10 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => scrollToId('apply')}
                className="rounded-full border px-7 py-3 text-sm font-semibold uppercase tracking-[0.1em] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(227,34,46,0.3)]"
                style={{ borderColor: RED, backgroundColor: '#0A0A0A', color: '#EAF4F7' }}
              >
                {joinUsHero.primaryCta}
              </button>
              <button
                type="button"
                onClick={() => scrollToId('domains')}
                className="rounded-full border border-white/15 px-7 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#E3222E66] hover:bg-[#E3222E0d]"
              >
                {joinUsHero.secondaryCta}
              </button>
            </motion.div>

            {/* Thin technical line — draws in left → right, echoing the
                Footer's system-line language without copying it verbatim. */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={reveal(0.66, 10)}
              className="mt-12 flex w-full max-w-[420px] items-center gap-3"
            >
              <span
                className="shrink-0 text-[10px] tracking-[0.2em]"
                style={{ fontFamily: DESCRIPTION_FONT, color: 'rgba(215,215,215,0.4)' }}
              >
                ACTIVATE
              </span>
              <div className="relative h-px flex-1 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <motion.div
                  className="absolute inset-y-0 left-0 w-full origin-left"
                  style={{ backgroundColor: RED }}
                  variants={lineReveal(0.78)}
                />
              </div>
            </motion.div>
          </div>

          {/* Hero visual — desktop only; a mobile-scaled, low-opacity copy
              sits behind the text (see JoinUsBackground). */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal(0.3, 20)}
            className="relative mx-auto hidden aspect-square w-full max-w-[440px] lg:block"
          >
            <HeroMechanicalVisual />
          </motion.div>
        </div>
      </section>

      <WhyDinobots />
      <DomainSelector />
      <ApplicationForm />

      {/* ============================== FINAL CTA (#final-cta) ============================== */}
      <section id="final-cta" className="relative z-10 flex w-full flex-col items-center gap-6 px-6 py-24 text-center">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={reveal(0)}
          className={`text-[clamp(1.5rem,4vw,2.5rem)] ${BRAND_HEADING_CLASSNAME}`}
          style={brandHeadingStyle}
        >
          {settings.joinUsFinalTitle}
        </motion.h2>
        {settings.joinUsFinalDescription && (
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={reveal(0.08)}
            className="max-w-xl text-sm leading-relaxed sm:text-base"
            style={{ fontFamily: DESCRIPTION_FONT, color: 'rgba(215,215,215,0.65)' }}
          >
            {settings.joinUsFinalDescription}
          </motion.p>
        )}
        <motion.button
          type="button"
          onClick={() => scrollToId('apply')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={reveal(0.15)}
          className="rounded-full border px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(227,34,46,0.32)]"
          style={{ borderColor: RED, backgroundColor: '#0A0A0A', color: '#EAF4F7' }}
        >
          {settings.joinUsFinalButtonText} →
        </motion.button>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={reveal(0.28)}
          className="mt-2 flex flex-col gap-0.5"
        >
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ fontFamily: DESCRIPTION_FONT, color: 'rgba(215,215,215,0.5)' }}
          >
            {joinUsFinalCta.line1}
          </span>
          <span
            className="text-[11px] font-medium uppercase tracking-[0.2em]"
            style={{ fontFamily: DESCRIPTION_FONT, color: 'rgba(215,215,215,0.35)' }}
          >
            {joinUsFinalCta.line2}
          </span>
        </motion.div>
      </section>

      {/* Reuses the exact existing Footer component — no second footer. */}
      <Footer active />
    </div>
  )
}
