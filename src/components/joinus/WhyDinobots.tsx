import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { whyDinobotsBlocks } from '../../content/joinUs'
import { BRAND_HEADING_CLASSNAME, brandHeadingStyle } from '../../styles/brandHeading'
import { useSiteSettings } from '../../hooks/useSiteSettings'

const EASE_OUT = [0.22, 1, 0.36, 1] as const
const BODY_FONT = "'Inter', sans-serif"
const HEADING_FONT = "'Unbounded', sans-serif"

const STEEL_TEXT = '#EDEDED'
const MUTED = 'rgba(215,215,215,0.6)'
const RED = '#B5121B'
const BRIGHT_RED = '#E3222E'

export default function WhyDinobots() {
  const reduceMotion = useReducedMotion()
  const settings = useSiteSettings()

  const container: Variants = reduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } } }

  const item: Variants = reduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 26 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
      }

  return (
    <section id="why-dinobots" className="relative z-10 w-full px-6 py-20 lg:px-12 lg:py-28">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={item}
          className={`text-center text-[clamp(1.75rem,4.5vw,3rem)] ${BRAND_HEADING_CLASSNAME}`}
          style={brandHeadingStyle}
        >
          {settings.joinUsWhyTitle}
        </motion.h2>
        {settings.joinUsWhyDescription && (
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={item}
            className="mt-4 max-w-2xl text-center text-sm leading-relaxed sm:text-base"
            style={{ fontFamily: BODY_FONT, color: MUTED }}
          >
            {settings.joinUsWhyDescription}
          </motion.p>
        )}

        <motion.div
          className="mt-14 grid w-full grid-cols-1 gap-px overflow-hidden rounded-xl border sm:grid-cols-2"
          style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.08)' }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={container}
        >
          {whyDinobotsBlocks.map((block) => (
            <motion.article
              key={block.number}
              variants={item}
              className="group relative flex flex-col gap-4 p-8 transition-all duration-300 ease-out hover:-translate-y-1 lg:p-10"
              style={{ backgroundColor: '#171A1D' }}
            >
              {/* Red accent line — expands on hover, the section's only
                  "glow"-adjacent flourish, and it's just a line. */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-[2px] w-10 transition-all duration-300 ease-out group-hover:w-full"
                style={{ backgroundColor: BRIGHT_RED }}
              />
              {/* Very subtle background lift on hover. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                style={{ backgroundColor: 'rgba(181,18,27,0.05)' }}
              />

              <span
                className="relative text-[clamp(2rem,4vw,2.75rem)] font-bold leading-none"
                style={{ fontFamily: HEADING_FONT, color: RED }}
              >
                {block.number}
              </span>
              <h3
                className="relative text-lg font-extrabold uppercase tracking-tight"
                style={{ fontFamily: HEADING_FONT, color: STEEL_TEXT }}
              >
                {block.title}
              </h3>
              <p className="relative text-sm leading-relaxed" style={{ fontFamily: BODY_FONT, color: MUTED }}>
                {block.description}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
