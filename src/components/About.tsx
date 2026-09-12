import { motion, type Variants } from 'framer-motion'
import { aboutContent } from '../content/about'
import { BRAND_HEADING_CLASSNAME, brandHeadingStyle } from '../styles/brandHeading'
import { useSiteSettings } from '../hooks/useSiteSettings'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const HEADING_FONT = "'Unbounded', sans-serif"
const BODY_FONT = "'IBM Plex Sans', sans-serif"
const LABEL_FONT = "'Inter', sans-serif"

// Section 2 palette — a premium light robotics environment, deliberately
// contrasting the Hero's black + red. Foreground text uses a warm
// ivory/metallic/red industrial treatment (no blue/cyan/purple/green) so it
// reads clearly against the background photo instead of washing out.
const SURFACE = '#F5FAFD'
const IVORY = 'rgba(244,236,222,0.92)'
const COPPER_ACCENT = '#C97A3D'
const TEXT_SHADOW = '0 1px 3px rgba(0,0,0,0.65), 0 2px 10px rgba(0,0,0,0.4)'

// Static full-bleed background photo for this section — no animation.
const ABOUT_BACKGROUND_SRC = '/dinobots-about-bg.jpeg'

// Temporary placeholder — swap this file in /public for the real team photo
// later; the card below is sized/cropped generically and needs no changes.
const TEAM_IMAGE_SRC = '/dinobots-logo.jpeg'

const reveal = (delay: number, duration = 0.8, distance = 28): Variants => ({
  hidden: { opacity: 0, y: distance, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration, delay, ease: EASE_OUT } },
})

export default function About() {
  const settings = useSiteSettings()
  const headingLines = settings.aboutHeading ? settings.aboutHeading.split('\n') : aboutContent.headingLines

  return (
    <section
      className="relative z-10 h-[100dvh] w-full overflow-hidden"
      style={{ backgroundColor: SURFACE }}
    >
      {/* Static full-bleed background photo — no animation of any kind. A
          very slight blur softens only this layer for depth; nothing else
          here is ever blurred. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url('${ABOUT_BACKGROUND_SRC}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(1.5px)',
        }}
      />

      {/* Very light readability wash — the image stays clearly visible. */}
      <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

      <div className="relative z-10 flex h-full w-full flex-col">
        <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-y-8 px-6 pb-10 pt-24 lg:grid-cols-2 lg:gap-y-12 lg:gap-x-[clamp(5rem,6vw,7.5rem)] lg:px-12 lg:py-24">
          {/* Text content — first in DOM so mobile shows it before the image
              (per the preferred stacking order); reordered to the right
              column on desktop via `lg:order-2`. */}
          <motion.div
            className="relative flex flex-col items-start lg:order-2 lg:items-end lg:text-right"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            {/* Soft dark scrim behind the entire text column (eyebrow through
                labels), not just the heading — this is what keeps every line
                of copy readable against the busy background photo instead of
                just the heading. Deliberately restrained (radial fade, no
                hard edge) so the background stays visible around it. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-4 -inset-y-6 lg:-inset-x-8 lg:-inset-y-8"
              style={{
                backgroundImage: 'radial-gradient(ellipse 95% 92% at 50% 50%, rgba(8,7,5,0.5) 0%, rgba(8,7,5,0) 78%)',
                filter: 'blur(18px)',
              }}
            />

            <motion.span
              variants={reveal(0)}
              className="relative text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ fontFamily: LABEL_FONT, color: COPPER_ACCENT, textShadow: TEXT_SHADOW }}
            >
              {settings.aboutTitle}
            </motion.span>

            <h2
              className={`relative mt-5 text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.02] ${BRAND_HEADING_CLASSNAME}`}
              style={brandHeadingStyle}
            >
              {headingLines.map((line, i) => (
                <motion.span key={line} className="block" variants={reveal(0.13 + i * 0.12, 0.85, 34)}>
                  {line}
                </motion.span>
              ))}
            </h2>

            <motion.p
              variants={reveal(0.42, 0.8, 20)}
              className="relative mt-7 max-w-[480px] text-base leading-relaxed sm:text-lg"
              style={{ fontFamily: BODY_FONT, color: IVORY, textShadow: TEXT_SHADOW }}
            >
              {settings.aboutDescription}
            </motion.p>

            <motion.div variants={reveal(0.6, 0.7, 14)} className="relative mt-10 flex flex-wrap gap-x-8 gap-y-3 lg:justify-end">
              {[settings.aboutLabel1, settings.aboutLabel2, settings.aboutLabel3, settings.aboutLabel4].map((label) => (
                <span
                  key={label}
                  className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.15em]"
                  style={{ fontFamily: LABEL_FONT, color: IVORY, textShadow: TEXT_SHADOW }}
                >
                  <span className="h-1 w-1 rounded-full" style={{ backgroundColor: COPPER_ACCENT }} />
                  {label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Large team image card — the section's left visual anchor on
              desktop (`lg:order-1`), sized toward ~46% of the content width
              and 55–65vh tall; stacks after the text on mobile. Same card
              surface/radius/hover language as ProjectCard (Projects
              section) so both card systems read as one design family —
              image and title now live inside a single card, image ~88% of
              the card height, title in a compact ~12% strip below it. */}
          <div className="mx-auto w-full max-w-[440px] lg:order-1 lg:mx-0 lg:mr-auto lg:max-w-[560px]">
            <motion.div
              className="group relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={reveal(0.35, 0.85, 26)}
            >
              {/* Hover-only glow layer — a soft green light sitting BEHIND
                  the card, extending slightly beyond it. Green is used only
                  here; the rest of the section stays blue/white/black. */}
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2.25rem] opacity-0 blur-2xl transition-all duration-[380ms] ease-out group-hover:-inset-7 group-hover:opacity-30"
                style={{ backgroundColor: '#52C98A' }}
              />

              <div
                className="relative flex aspect-[4/3] w-[88vw] max-w-[440px] flex-col overflow-hidden rounded-[22px] border shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-[380ms] ease-out group-hover:-translate-y-1 group-hover:scale-[1.02] sm:w-full lg:aspect-auto lg:h-[58vh] lg:max-h-[620px] lg:min-h-[380px] lg:w-full lg:max-w-[560px]"
                style={{ backgroundColor: 'rgba(0,0,0,0.65)', borderColor: 'rgba(255,255,255,0.14)' }}
              >
                <div className="relative h-[88%] w-full shrink-0 overflow-hidden">
                  <img
                    src={TEAM_IMAGE_SRC}
                    alt="Dinobots team"
                    className="h-full w-full object-cover transition-transform duration-[380ms] ease-out group-hover:scale-[1.02]"
                  />
                </div>

                <div className="flex h-[12%] w-full items-center justify-center">
                  <span
                    className="text-sm font-bold uppercase tracking-[0.15em]"
                    style={{ fontFamily: HEADING_FONT, color: '#F1F4F5' }}
                  >
                    {aboutContent.imageCaption.title}
                  </span>
                </div>

                {/* Hover-only border brighten, matching ProjectCard's technique. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[22px] border opacity-0 transition-opacity duration-[380ms] ease-out group-hover:opacity-100"
                  style={{ borderColor: 'rgba(255,255,255,0.32)' }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
